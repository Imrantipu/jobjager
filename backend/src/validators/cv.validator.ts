import { z } from 'zod';

// Personal Info Schema
const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(50),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().max(100).optional(),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  summary: z.string().max(1000).optional(),
});

// Experience Schema
const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required').max(200),
  position: z.string().min(1, 'Position is required').max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, 'Description is required').max(2000),
  achievements: z.array(z.string()).optional(),
});

// Education Schema
const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution name is required').max(200),
  degree: z.string().min(1, 'Degree is required').max(200),
  fieldOfStudy: z.string().min(1, 'Field of study is required').max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  grade: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
});

// Skill Schema
const skillSchema = z.object({
  id: z.string(),
  category: z.string().min(1, 'Category is required').max(100),
  name: z.string().min(1, 'Skill name is required').max(100),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
});

// Language Schema
const languageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Language name is required').max(100),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']),
  description: z.string().max(500).optional(),
});

/**
 * Create CV schema validation
 */
export const createCVSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  personalInfo: personalInfoSchema,
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  languages: z.array(languageSchema).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Update CV schema validation (all fields optional except when provided)
 */
export const updateCVSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  personalInfo: personalInfoSchema.optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  languages: z.array(languageSchema).optional(),
  isDefault: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * Duplicate CV schema validation
 */
export const duplicateCVSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
});

// Export types inferred from schemas
export type CreateCVInput = z.infer<typeof createCVSchema>;
export type UpdateCVInput = z.infer<typeof updateCVSchema>;
export type DuplicateCVInput = z.infer<typeof duplicateCVSchema>;
