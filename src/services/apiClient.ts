import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';

//  axios client to main backend service
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to main API client
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (e) {
    console.log('No session');
  }

  return config;
});


// Response interceptor to handle 401 and attempt token refresh
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔥 FORCE refresh
        const session = await fetchAuthSession({ forceRefresh: true });
        const newToken = session.tokens?.idToken?.toString();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest); // retry request
        }
      } catch (e) {
        console.error('Refresh failed');
      }
    }

    return Promise.reject(error);
  }
);


export  {apiClient};
