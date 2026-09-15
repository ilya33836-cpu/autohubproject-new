import axios from 'axios';

// API Configuration
// Use environment variable or fallback to localhost for development
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();

// Axios-инстанс с базовым URL и автоматическим Bearer-токеном из localStorage.
// Использование: import api from '../utils/api'; api.get('/services/');
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
