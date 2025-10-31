// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// CV Types
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
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
  current: boolean;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  category: string;
  name: string;
  level: SkillLevel;
}

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';

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

// Job Types
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

// Application Types
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
  cv?: CV;
}

// Anschreiben (Cover Letter) Types
export interface Anschreiben {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  content: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateAnschreibenRequest {
  jobDescription: string;
  companyName: string;
  positionTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  relevantExperience?: string;
  motivation?: string;
}

export interface RefineAnschreibenRequest {
  instructions: string;
}

// Company Types
export interface Company {
  id: string;
  userId: string;
  name: string;
  techStack: string[];
  cultureNotes?: string;
  salaryInfo?: string;
  glassdoorRating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Statistics Types
export interface JobStatistics {
  total: number;
  saved: number;
  byPlatform: Record<string, number>;
}

export interface ApplicationStatistics {
  total: number;
  byStatus: {
    TO_APPLY: number;
    APPLIED: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
  successRate: number;
}

export interface CVStatistics {
  total: number;
  hasDefault: boolean;
}

export interface AnschreibenStatistics {
  total: number;
  templates: number;
  applicationSpecific: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Kanban Board Types
export interface KanbanColumn {
  status: ApplicationStatus;
  applications: Application[];
}

export interface KanbanBoard {
  TO_APPLY: Application[];
  APPLIED: Application[];
  INTERVIEW: Application[];
  OFFER: Application[];
  REJECTED: Application[];
}
