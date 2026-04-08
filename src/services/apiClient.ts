import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Cognito access token if available
apiClient.interceptors.request.use(
  (config) => {
    // Token is set dynamically via setAuthToken() after login
    const token = apiClient.defaults.headers.common['Authorization'];
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — standardized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized — token may have expired');
    }
    return Promise.reject(error);
  },
);

/**
 * Call this after login to attach the Cognito access token
 * to all subsequent API requests.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
