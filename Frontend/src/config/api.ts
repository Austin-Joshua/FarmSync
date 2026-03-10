/**
 * Single source of truth for backend connection.
 * Set VITE_API_URL in .env to override (e.g. http://localhost:5001/api).
 */
const BACKEND_DEFAULT = 'http://localhost:5001';
const explicitBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '');
const base = explicitBase || BACKEND_DEFAULT;
export const API_BASE_URL = `${base.replace(/\/$/, '')}/api`;
/** Backend origin for display in error messages (no /api) */
export const BACKEND_ORIGIN = base.replace(/\/$/, '');
