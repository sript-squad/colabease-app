import { CreateTaskPayload, UpdateTaskPayload } from '../types/Task.types';
import { apiClient } from './apiClient';

export const taskService = {
  getAll: (projectId?: string) => {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/tasks', { params });
  },
  getOne: (id: string) => apiClient.get(`/tasks/${id}`),
  create: (data: CreateTaskPayload) => apiClient.post('/tasks', data),
  update: (id: string, data: UpdateTaskPayload) => apiClient.patch(`/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};
