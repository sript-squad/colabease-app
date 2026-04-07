// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:3000', //backend url
// });

// export const projectService = {
//   getAll: (status?: string) => API.get('/projects', { params: status ? { status } : {} }),
//   getOne: (id: string) => API.get(`/projects/${id}`),
//   create: (data: unknown) => API.post('/projects', data),
//   update: (id: string, data: unknown) => API.patch(`/projects/${id}`, data),
//   delete: (id: string) => API.delete(`/projects/${id}`),
// };

import axios from 'axios';
import { CreateProjectPayload, UpdateProjectPayload } from '../types/Project.types';
// '../types/project.types';
const API = axios.create({
  baseURL: 'http://localhost:3000',
});

export const projectService = {
  getAll: (status?: string) => {
    const params = status && status !== '' ? { status } : {};
    return API.get('/projects', { params });
  },
  getOne:  (id: string) =>
    API.get(`/projects/${id}`),
  create:  (data: CreateProjectPayload) =>
    API.post('/projects', data),
  update:  (id: string, data: UpdateProjectPayload) =>
    API.patch(`/projects/${id}`, data),
  delete:  (id: string) =>
    API.delete(`/projects/${id}`),
};