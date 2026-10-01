const ORS_GEOCODE_URL = 'https://api.openrouteservice.org/geocode/search';
const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/json';

export class RouteServiceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

function cleanLocation(value, fieldName) {
  const location = typeof value === 'string' ? value.trim() : '';
  if (location.length < 2 || location.length > 160) throw new RouteServiceError(`Enter a valid ${fieldName}.`, 400);
  return location;
}

async function orsFetch(url, options = {}) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(12000) });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new RouteServiceError('OpenRouteService took too long to respond. Please try again.', 504);
    }
    throw new RouteServiceError('Unable to connect to OpenRouteService. Please try again.', 502);
  }
}

async function readJson(response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new RouteServiceError('The OpenRouteService key is invalid or does not have access to this service.', 503);
    }
    if (response.status === 429) {
      throw new RouteServiceError('OpenRouteService has reached its request limit. Please try again shortly.', 503);
    }
    throw new RouteServiceError('OpenRouteService could not calculate this route. Please try a more specific place name.', 502);
  }
  return body;
}

async function geocodePlace(query, apiKey) {
  const url = new URL(ORS_GEOCODE_URL);
  url.searchParams.set('text', query);
  url.searchParams.set('boundary.country', 'IN');
  url.searchParams.set('limit', '1');
  const data = await readJson(await orsFetch(url, { headers: { Authorization: apiKey } }));
  const match = data.features?.[0];
  const [longitude, latitude] = match?.geometry?.coordinates ?? [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new RouteServiceError(`We couldn't find “${query}”. Try including the locality or landmark.`, 404);
  }
  return { latitude, longitude, label: match.properties?.label || query };
}

export async function getOrsRoute(payload, apiKey) {
  if (!apiKey) throw new RouteServiceError('Routing has not been configured yet. Add ORS_API_KEY to the server environment.', 503);
  const originQuery = cleanLocation(payload?.origin, 'starting location');
  const destinationQuery = cleanLocation(payload?.destination, 'destination');
  const [origin, destination] = await Promise.all([geocodePlace(originQuery, apiKey), geocodePlace(destinationQuery, apiKey)]);
  const data = await readJson(await orsFetch(ORS_DIRECTIONS_URL, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: [[origin.longitude, origin.latitude], [destination.longitude, destination.latitude]] }),
  }));
  const summary = data.routes?.[0]?.summary;
  if (!Number.isFinite(summary?.distance) || !Number.isFinite(summary?.duration)) {
    throw new RouteServiceError('OpenRouteService did not return a drivable route for those places.', 422);
  }
  return {
    origin: origin.label,
    destination: destination.label,
    distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
    durationMinutes: Math.round(summary.duration / 60),
  };
}
