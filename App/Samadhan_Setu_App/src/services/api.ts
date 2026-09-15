/**
 * Samadhan Setu — API Service
 * Axios instance configured for Report_Maro / Samadhan_Setu Express backend.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://report-maro-1.onrender.com/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s to accommodate Render free-tier cold starts (~30-50s)
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

// Request interceptor — attach JWT Bearer token and log request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — graceful error handling for unauthenticated / expired requests & network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401 Unauthorized — user is not logged in or JWT token expired
      console.log('[API] Unauthenticated (401) — backend requires JWT login token.');
    } else if (!error.response) {
      // Network Error / Timeout / Host unreachable
      const targetUrl = `${error.config?.baseURL || API_BASE_URL}${error.config?.url || ''}`;
      console.error(
        `[API Network Error] Unable to reach backend at: ${targetUrl}. ` +
        `Check if backend is online and accessible. (Message: ${error.message}, Code: ${error.code || 'UNKNOWN'})`
      );
    }
    return Promise.reject(error);
  }
);

export default api;
