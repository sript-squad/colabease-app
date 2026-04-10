import { apiClient } from './apiClient';

export const authService = {
  checkUser: async (email: string) => {
    return apiClient.get<{ exists: boolean }>(`/auth/check-user?email=${email}`);
  },
  getMe: async () => {
    return apiClient.get('/auth/me');
  },
  updateMe: async (data: any) => {
    return apiClient.patch('/auth/me', data);
  }
};
