import api from './api';
import type { Job } from './jobService';

export type ApplicationStatus = 'TO_APPLY' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  cvId: string;
  status: ApplicationStatus;
  appliedDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  notes?: string;
  contactPerson?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export interface CreateApplicationData {
  jobId: string;
  cvId: string;
  status: ApplicationStatus;
  appliedDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  notes?: string;
  contactPerson?: string;
}

export interface KanbanBoard {
  TO_APPLY: Application[];
  APPLIED: Application[];
  INTERVIEW: Application[];
  OFFER: Application[];
  REJECTED: Application[];
}

export class ApplicationService {
  static async getAll(): Promise<Application[]> {
    const response = await api.get('/applications');
    return response.data.data;
  }

  static async getById(id: string): Promise<Application> {
    const response = await api.get(`/applications/${id}`);
    return response.data.data;
  }

  static async getKanban(): Promise<KanbanBoard> {
    const response = await api.get('/applications/kanban');
    return response.data.data;
  }

  static async create(data: CreateApplicationData): Promise<Application> {
    const response = await api.post('/applications', data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateApplicationData>): Promise<Application> {
    const response = await api.put(`/applications/${id}`, data);
    return response.data.data;
  }

  static async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  }

  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<ApplicationStatus, number>;
    successRate: number;
  }> {
    const response = await api.get('/applications/statistics');
    return response.data.data;
  }
}
