import api from './api';

export interface Anschreiben {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  content: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    status: string;
    job?: {
      companyName: string;
      positionTitle: string;
    };
  };
}

export interface GenerateAnschreibenData {
  companyName: string;
  positionTitle: string;
  jobDescription: string;
  applicantName: string;
  applicantQualifications: string;
  applicationId?: string;
  isTemplate?: boolean;
}

export interface CreateAnschreibenData {
  title: string;
  content: string;
  applicationId?: string;
  isTemplate?: boolean;
}

export interface UpdateAnschreibenData extends Partial<CreateAnschreibenData> {}

export interface RefineAnschreibenData {
  improvementInstructions: string;
}

export interface AnschreibenStatistics {
  total: number;
  templates: number;
  linked: number;
}

export interface AnschreibenFilters {
  isTemplate?: boolean;
  applicationId?: string;
}

export const AnschreibenService = {
  // Generate Anschreiben with AI
  generate: async (data: GenerateAnschreibenData): Promise<Anschreiben> => {
    const response = await api.post('/anschreiben/generate', data);
    return response.data.data;
  },

  // Refine existing Anschreiben with AI
  refine: async (id: string, data: RefineAnschreibenData): Promise<Anschreiben> => {
    const response = await api.post(`/anschreiben/${id}/refine`, data);
    return response.data.data;
  },

  // Get all Anschreiben
  getAll: async (filters?: AnschreibenFilters): Promise<Anschreiben[]> => {
    const params = new URLSearchParams();
    if (filters?.isTemplate !== undefined) {
      params.append('isTemplate', String(filters.isTemplate));
    }
    if (filters?.applicationId) {
      params.append('applicationId', filters.applicationId);
    }
    const queryString = params.toString();
    const url = queryString ? `/anschreiben?${queryString}` : '/anschreiben';
    const response = await api.get(url);
    return response.data.data;
  },

  // Get single Anschreiben
  getById: async (id: string): Promise<Anschreiben> => {
    const response = await api.get(`/anschreiben/${id}`);
    return response.data.data;
  },

  // Get Anschreiben by application ID
  getByApplicationId: async (applicationId: string): Promise<Anschreiben | null> => {
    const response = await api.get(`/anschreiben/application/${applicationId}`);
    return response.data.data;
  },

  // Get Anschreiben statistics
  getStatistics: async (): Promise<AnschreibenStatistics> => {
    const response = await api.get('/anschreiben/statistics');
    return response.data.data;
  },

  // Create new Anschreiben manually
  create: async (data: CreateAnschreibenData): Promise<Anschreiben> => {
    const response = await api.post('/anschreiben', data);
    return response.data.data;
  },

  // Update Anschreiben
  update: async (id: string, data: UpdateAnschreibenData): Promise<Anschreiben> => {
    const response = await api.put(`/anschreiben/${id}`, data);
    return response.data.data;
  },

  // Duplicate Anschreiben
  duplicate: async (id: string, newTitle: string): Promise<Anschreiben> => {
    const response = await api.post(`/anschreiben/${id}/duplicate`, { title: newTitle });
    return response.data.data;
  },

  // Delete Anschreiben
  delete: async (id: string): Promise<void> => {
    await api.delete(`/anschreiben/${id}`);
  },
};
