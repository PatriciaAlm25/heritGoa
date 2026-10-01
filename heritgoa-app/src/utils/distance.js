// ═══════════════════════════════════════════════════════════════
// HeritGoa — Distance Utility (Haversine Formula)
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate the great-circle distance between two lat/lon points.
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometres (rounded to 1 decimal)
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

/**
 * Find nearby heritage sites sorted by distance.
 * Only includes sites with valid coordinates.
 * @param {object} site - The reference site (must have latitude & longitude)
 * @param {Array}  allSites - Full dataset
 * @param {number} maxResults - Maximum number of results (default 5)
 * @param {number} maxDistanceKm - Maximum distance filter (default 30km)
 * @returns {Array} Sorted array of { site, distanceKm }
 */
export function getNearbyHeritage(site, allSites, maxResults = 5, maxDistanceKm = 30) {
  if (!site.latitude || !site.longitude) return [];

  return allSites
    .filter(s =>
      s.site_id !== site.site_id &&
      s.latitude != null &&
      s.longitude != null
    )
    .map(s => ({
      site: s,
      distanceKm: haversineDistance(site.latitude, site.longitude, s.latitude, s.longitude),
    }))
    .filter(({ distanceKm }) => distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, maxResults);
}
