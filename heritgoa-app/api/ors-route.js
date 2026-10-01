import { RouteServiceError, getOrsRoute } from '../server/orsRoute.js';

// Vercel serverless function. Keep ORS_API_KEY in the hosting provider's
// server environment; never expose it through a VITE_ client variable.
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const route = await getOrsRoute(request.body, process.env.ORS_API_KEY);
    return response.status(200).json(route);
  } catch (error) {
    const status = error instanceof RouteServiceError ? error.status : 500;
    return response.status(status).json({ error: error.message || 'Unable to calculate the route.' });
  }
}
