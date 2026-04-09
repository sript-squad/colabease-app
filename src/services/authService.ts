import { apiClient } from './apiClient';

export const authService = {
  checkUser: async (email: string) => {
    return apiClient.get<{ exists: boolean }>(`/auth/check-user?email=${email}`);
  }
};
