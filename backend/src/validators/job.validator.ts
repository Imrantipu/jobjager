import { z } from 'zod';

/**
 * Create job schema validation
 */
export const createJobSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  positionTitle: z
    .string()
    .min(1, 'Position title is required')
    .max(200, 'Position title must be less than 200 characters'),
  jobDescription: z
    .string()
    .max(10000, 'Job description must be less than 10000 characters')
    .optional(),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  salaryRange: z
    .string()
    .max(100, 'Salary range must be less than 100 characters')
    .optional(),
  techStack: z
    .array(z.string())
    .max(50, 'Maximum 50 technologies allowed')
    .optional(),
  sourceUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  sourcePlatform: z
    .string()
    .max(100, 'Source platform must be less than 100 characters')
    .optional(),
  isSaved: z
    .boolean()
    .optional(),
});

/**
 * Update job schema validation (all fields optional)
 */
export const updateJobSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name cannot be empty')
    .max(200, 'Company name must be less than 200 characters')
    .optional(),
  positionTitle: z
    .string()
    .min(1, 'Position title cannot be empty')
    .max(200, 'Position title must be less than 200 characters')
    .optional(),
  jobDescription: z
    .string()
    .max(10000, 'Job description must be less than 10000 characters')
    .optional()
    .nullable(),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .nullable(),
  salaryRange: z
    .string()
    .max(100, 'Salary range must be less than 100 characters')
    .optional()
    .nullable(),
  techStack: z
    .array(z.string())
    .max(50, 'Maximum 50 technologies allowed')
    .optional(),
  sourceUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .nullable()
    .or(z.literal('')),
  sourcePlatform: z
    .string()
    .max(100, 'Source platform must be less than 100 characters')
    .optional()
    .nullable(),
  isSaved: z
    .boolean()
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Export types inferred from schemas
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
