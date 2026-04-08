export interface Document {
  _id: string;
  title: string;
  content: string;
  projectId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  title: string;
  content: string;
  projectId: string;
  authorId: string;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: string;
}
