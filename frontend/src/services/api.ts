import axios from 'axios';

declare global {
  interface Window {
    __SENSECHAIN_API_URL__?: string;
  }
}

function resolveApiBaseUrl() {
  const value = typeof window !== 'undefined' ? window.__SENSECHAIN_API_URL__ : undefined;
  if (!value || value.startsWith('%')) {
    return 'http://localhost:5000/api';
  }

  return value;
}

const baseURL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('sensechainai.token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});