import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

/**
 * Create application schema validation
 */
export const createApplicationSchema = z.object({
  jobId: z
    .string()
    .uuid('Invalid job ID format'),
  cvId: z
    .string()
    .uuid('Invalid CV ID format')
    .optional(),
  status: z
    .nativeEnum(ApplicationStatus)
    .optional(),
  appliedDate: z
    .string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .optional(),
  followUpDate: z
    .string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .optional(),
  interviewDate: z
    .string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .optional(),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional(),
  contactPerson: z
    .string()
    .max(200, 'Contact person must be less than 200 characters')
    .optional(),
});

/**
 * Update application schema validation (all fields optional)
 */
export const updateApplicationSchema = z.object({
  status: z
    .nativeEnum(ApplicationStatus)
    .optional(),
  cvId: z
    .string()
    .uuid('Invalid CV ID format')
    .optional()
    .nullable(),
  appliedDate: z
    .string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .optional()
    .nullable(),
  followUpDate: z
    .string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .optional()
    .nullable(),
  interviewDate: z
    .string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional()
    .nullable(),
  contactPerson: z
    .string()
    .max(200, 'Contact person must be less than 200 characters')
    .optional()
    .nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * Update status schema validation
 */
export const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

// Export types inferred from schemas
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
