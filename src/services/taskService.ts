import axios from 'axios';
import { CreateTaskPayload, UpdateTaskPayload } from '../types/Task.types';

const API = axios.create({
  baseURL: 'http://localhost:3000',
});

export const taskService = {
  getAll: (projectId?: string) => {
    const params = projectId ? { projectId } : {};
    return API.get('/tasks', { params });
  },
  getOne: (id: string) => API.get(`/tasks/${id}`),
  create: (data: CreateTaskPayload) => API.post('/tasks', data),
  update: (id: string, data: UpdateTaskPayload) => API.patch(`/tasks/${id}`, data),
  delete: (id: string) => API.delete(`/tasks/${id}`),
};
