import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { RouteServiceError, getOrsRoute } from './server/orsRoute.js';

function orsDevelopmentProxy(apiKey) {
  return {
    name: 'ors-development-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ors-route', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.setHeader('Allow', 'POST');
          response.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }
        try {
          let rawBody = '';
          for await (const chunk of request) rawBody += chunk;
          const route = await getOrsRoute(JSON.parse(rawBody || '{}'), apiKey);
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(route));
        } catch (error) {
          response.statusCode = error instanceof RouteServiceError ? error.status : 500;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ error: error.message || 'Unable to calculate the route.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), orsDevelopmentProxy(env.ORS_API_KEY)],
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'leaflet';
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'react-vendor';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/lucide-react')) return 'lucide';
          },
        },
      },
    },
  };
});
