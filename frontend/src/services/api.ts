import axios from 'axios';

declare global {
  interface Window {
    __SMARTCHAIN_API_URL__?: string;
  }
}

function resolveApiBaseUrl() {
  const runtimeValue = typeof window !== 'undefined' ? window.__SMARTCHAIN_API_URL__ : undefined;
  if (runtimeValue && !runtimeValue.startsWith('%')) {
    return runtimeValue;
  }

  const viteValue = import.meta.env.VITE_API_URL;
  if (viteValue && !viteValue.startsWith('%')) {
    return viteValue;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  return 'http://localhost:5000/api';
}

const baseURL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('smartchainai.token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseMessage = error?.response?.data?.message;
    const responseDetails = error?.response?.data?.details;

    if (Array.isArray(responseDetails) && responseDetails.length > 0) {
      const detailMessage = responseDetails.map((item: unknown) => String(item)).join(' | ');
      if (responseMessage) {
        return Promise.reject(new Error(`${String(responseMessage)}: ${detailMessage}`));
      }

      return Promise.reject(new Error(detailMessage));
    }

    if (responseMessage) {
      return Promise.reject(new Error(String(responseMessage)));
    }

    if (error?.response?.status) {
      return Promise.reject(new Error(`Request failed with status ${error.response.status}`));
    }

    return Promise.reject(new Error('Network error: unable to reach SmartChainAI backend. Verify backend is running and API URL is correct.'));
  }
);