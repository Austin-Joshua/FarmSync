/**
 * Single source of truth for backend connection.
 *
 * - In dev with no VITE_API_URL: uses relative "/api" so Vite proxy forwards to backend (no CORS).
 * - With VITE_API_URL or in production: uses that URL or http://localhost:5003/api.
 * Set VITE_API_URL in Frontend/.env to point to your backend (e.g. http://localhost:5003/api).
 */
const BACKEND_DEFAULT = 'http://localhost:9090';
const explicitBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '');
const useProxy = import.meta.env.DEV && !explicitBase;
const base = explicitBase || BACKEND_DEFAULT;
export const API_BASE_URL = useProxy ? '/api' : `${base.replace(/\/$/, '')}/api`;
/** Backend origin for error messages and image URLs (always the real backend host) */
export const BACKEND_ORIGIN = base.replace(/\/$/, '');
