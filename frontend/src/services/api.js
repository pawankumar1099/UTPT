import axios from 'axios';

// Single axios instance. The base URL is read from VITE_API_BASE_URL so the
// app can point at the future Node/Express + MongoDB backend without code
// changes. Until then, the service files below resolve with mock data.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('utpt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
