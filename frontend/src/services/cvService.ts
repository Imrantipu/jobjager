import api from './api';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  grade?: string;
}

export interface Skill {
  category: string;
  name: string;
  level: SkillLevel;
}

export interface Language {
  name: string;
  level: LanguageLevel;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCVData {
  title: string;
  personalInfo: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  languages?: Language[];
  isDefault?: boolean;
}

export interface UpdateCVData extends Partial<CreateCVData> {}

export interface CVStatistics {
  total: number;
  defaultCV: CV | null;
}

export const CVService = {
  // Get all CVs
  getAll: async (): Promise<CV[]> => {
    const response = await api.get('/cvs');
    return response.data.data;
  },

  // Get single CV
  getById: async (id: string): Promise<CV> => {
    const response = await api.get(`/cvs/${id}`);
    return response.data.data;
  },

  // Get default CV
  getDefault: async (): Promise<CV | null> => {
    const response = await api.get('/cvs/default');
    return response.data.data;
  },

  // Get CV statistics
  getStatistics: async (): Promise<CVStatistics> => {
    const response = await api.get('/cvs/statistics');
    return response.data.data;
  },

  // Create new CV
  create: async (data: CreateCVData): Promise<CV> => {
    const response = await api.post('/cvs', data);
    return response.data.data;
  },

  // Update CV
  update: async (id: string, data: UpdateCVData): Promise<CV> => {
    const response = await api.put(`/cvs/${id}`, data);
    return response.data.data;
  },

  // Set CV as default
  setAsDefault: async (id: string): Promise<CV> => {
    const response = await api.patch(`/cvs/${id}/default`);
    return response.data.data;
  },

  // Duplicate CV
  duplicate: async (id: string, newTitle: string): Promise<CV> => {
    const response = await api.post(`/cvs/${id}/duplicate`, { title: newTitle });
    return response.data.data;
  },

  // Delete CV
  delete: async (id: string): Promise<void> => {
    await api.delete(`/cvs/${id}`);
  },
};
