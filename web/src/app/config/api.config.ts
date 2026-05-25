// Central API URL for the frontend. Can be overridden via Vite env var VITE_API_URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
