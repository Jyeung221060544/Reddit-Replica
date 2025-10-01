import axios from 'axios';

// Prefer env var; fall back to same-origin (useful if you ever serve client from server)
const baseURL =
  process.env.REACT_APP_API_URL ||
  `${window.location.origin.replace(/\/$/, '')}`;

const api = axios.create({ baseURL });

export default api;
