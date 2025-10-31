import api from './api';

export interface Job {
  id: string;
  userId: string;
  companyName: string;
  positionTitle: string;
  jobDescription: string;
  location: string;
  salaryRange?: string;
  techStack: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  companyName: string;
  positionTitle: string;
  jobDescription: string;
  location: string;
  salaryRange?: string;
  techStack?: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  isSaved?: boolean;
}

export interface JobFilters {
  company?: string;
  position?: string;
  location?: string;
  techStack?: string;
  saved?: boolean;
  page?: number;
  limit?: number;
}

export class JobService {
  static async getAll(filters?: JobFilters): Promise<Job[]> {
    const params = new URLSearchParams();
    if (filters?.company) params.append('company', filters.company);
    if (filters?.position) params.append('position', filters.position);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.techStack) params.append('techStack', filters.techStack);
    if (filters?.saved !== undefined) params.append('saved', filters.saved.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data.data;
  }

  static async getById(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data;
  }

  static async create(data: CreateJobData): Promise<Job> {
    const response = await api.post('/jobs', data);
    return response.data.data;
  }

  static async update(id: string, data: Partial<CreateJobData>): Promise<Job> {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  }

  static async toggleSaved(id: string): Promise<Job> {
    const response = await api.patch(`/jobs/${id}/save`);
    return response.data.data;
  }

  static async search(query: string): Promise<Job[]> {
    const response = await api.get(`/jobs/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
  }
}
