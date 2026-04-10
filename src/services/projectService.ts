import { CreateProjectPayload, UpdateProjectPayload } from '../types/Project.types';
import { apiClient } from './apiClient';

export const projectService = {
  getAll: (status?: string) => {
    const params = status && status !== '' ? { status } : {};
    return apiClient.get('/projects', { params });
  },
  getOne: (id: string) =>
    apiClient.get(`/projects/${id}`),
  create: (data: CreateProjectPayload) =>
    apiClient.post('/projects', data),
  update: (id: string, data: UpdateProjectPayload) =>
    apiClient.patch(`/projects/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),
};