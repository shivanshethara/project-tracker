import axios from 'axios';

// Centralised axios instance. baseURL '/api' is proxied by Vite to the
// Express backend in development (see vite.config.js).
const api = axios.create({
  baseURL: '/api',
});

export default api;
