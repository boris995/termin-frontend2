import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const getApiErrorMessage = (error: unknown, fallback = 'Backend ili baza nisu dostupni.') => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', {
      message: getApiErrorMessage(error),
      method: error.config?.method,
      url: error.config?.url,
      status: error.response?.status,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const unwrap = <T>(response: { data: { data: T } }) => response.data.data;

export const asArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);
