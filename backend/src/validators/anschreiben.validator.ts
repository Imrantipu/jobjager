import { z } from 'zod';

/**
 * Schema for generating an Anschreiben using AI
 */
export const generateAnschreibenSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID').optional(),
  jobDescription: z.string().min(10, 'Job description is too short').max(5000, 'Job description is too long'),
  companyName: z.string().min(1, 'Company name is required').max(200),
  positionTitle: z.string().min(1, 'Position title is required').max(200),
  applicantName: z.string().min(1, 'Applicant name is required').max(200),
  applicantEmail: z.string().email('Invalid email address'),
  applicantPhone: z.string().min(1, 'Phone number is required').max(50),
  experience: z.string().max(2000).optional(),
  skills: z.string().max(1000).optional(),
  education: z.string().max(1000).optional(),
  motivation: z.string().max(1000).optional(),
  saveAsTemplate: z.boolean().optional(),
});

/**
 * Schema for creating an Anschreiben manually
 */
export const createAnschreibenSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID').optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(10, 'Content is too short').max(10000, 'Content is too long'),
  isTemplate: z.boolean().optional(),
});

/**
 * Schema for updating an Anschreiben
 */
export const updateAnschreibenSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  content: z.string().min(10, 'Content is too short').max(10000, 'Content is too long').optional(),
  isTemplate: z.boolean().optional(),
  applicationId: z.string().uuid('Invalid application ID').optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * Schema for duplicating an Anschreiben
 */
export const duplicateAnschreibenSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
});

/**
 * Schema for refining an Anschreiben with AI
 */
export const refineAnschreibenSchema = z.object({
  improvementInstructions: z.string().min(5, 'Improvement instructions are too short').max(1000),
});

// Export types inferred from schemas
export type GenerateAnschreibenInput = z.infer<typeof generateAnschreibenSchema>;
export type CreateAnschreibenInput = z.infer<typeof createAnschreibenSchema>;
export type UpdateAnschreibenInput = z.infer<typeof updateAnschreibenSchema>;
export type DuplicateAnschreibenInput = z.infer<typeof duplicateAnschreibenSchema>;
export type RefineAnschreibenInput = z.infer<typeof refineAnschreibenSchema>;
