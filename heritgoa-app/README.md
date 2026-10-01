# React + Vite

## OpenRouteService setup

The taxi fare estimator sends place names to a protected `/api/ors-route` endpoint. That endpoint geocodes both places and requests an OpenRouteService `driving-car` route; only the returned road distance is sent back to the browser.

For local development, copy `.env.example` to `.env.local` and set `ORS_API_KEY`. For Vercel deployments, set the same variable in the project's server environment. Never use a `VITE_` prefix for this key, because that would expose it to every visitor.

The `api/ors-route.js` function is a Vercel-compatible serverless route. On another host, implement the same protected POST endpoint and keep the key in that host's server-side environment.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
