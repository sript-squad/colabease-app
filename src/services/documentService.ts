import { Document, CreateDocumentDto, UpdateDocumentDto } from '../types/Document.types';
import { apiClient } from './apiClient';

export const documentService = {
  getAll: (projectId?: string) => 
    apiClient.get<Document[]>('/documents', { params: { projectId } }),
  
  getOne: (id: string) => 
    apiClient.get<Document>(`/documents/${id}`),
  
  create: (data: CreateDocumentDto) => 
    apiClient.post<Document>('/documents', data),
  
  update: (id: string, data: UpdateDocumentDto) => 
    apiClient.patch<Document>(`/documents/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/documents/${id}`),
};
