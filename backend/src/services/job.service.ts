import prisma from '../config/database';
import { Prisma } from '@prisma/client';

// Types
interface CreateJobData {
  userId: string;
  companyName: string;
  positionTitle: string;
  jobDescription?: string;
  location?: string;
  salaryRange?: string;
  techStack?: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  isSaved?: boolean;
}

interface UpdateJobData {
  companyName?: string;
  positionTitle?: string;
  jobDescription?: string;
  location?: string;
  salaryRange?: string;
  techStack?: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  isSaved?: boolean;
}

interface JobFilters {
  companyName?: string;
  positionTitle?: string;
  location?: string;
  techStack?: string[];
  isSaved?: boolean;
}

export class JobService {
  /**
   * Create a new job
   */
  static async create(data: CreateJobData) {
    const job = await prisma.job.create({
      data: {
        userId: data.userId,
        companyName: data.companyName,
        positionTitle: data.positionTitle,
        jobDescription: data.jobDescription || null,
        location: data.location || null,
        salaryRange: data.salaryRange || null,
        techStack: data.techStack || [],
        sourceUrl: data.sourceUrl || null,
        sourcePlatform: data.sourcePlatform || null,
        isSaved: data.isSaved ?? true,
      },
    });

    return job;
  }

  /**
   * Get all jobs for a user with optional filters and pagination
   */
  static async getAllByUser(
    userId: string,
    filters?: JobFilters,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.JobWhereInput = {
      userId,
      ...(filters?.companyName && {
        companyName: {
          contains: filters.companyName,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
      ...(filters?.positionTitle && {
        positionTitle: {
          contains: filters.positionTitle,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
      ...(filters?.location && {
        location: {
          contains: filters.location,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
      ...(filters?.techStack && filters.techStack.length > 0 && {
        techStack: {
          hasSome: filters.techStack,
        },
      }),
      ...(filters?.isSaved !== undefined && {
        isSaved: filters.isSaved,
      }),
    };

    // Get jobs and total count in parallel
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single job by ID
   */
  static async getById(jobId: string, userId: string) {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId,
      },
      include: {
        applications: {
          include: {
            cv: {
              select: {
                id: true,
                title: true,
              },
            },
            anschreiben: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  /**
   * Update a job
   */
  static async update(jobId: string, userId: string, data: UpdateJobData) {
    // Check if job exists and belongs to user
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId,
      },
    });

    if (!existingJob) {
      throw new Error('Job not found');
    }

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.positionTitle && { positionTitle: data.positionTitle }),
        ...(data.jobDescription !== undefined && { jobDescription: data.jobDescription }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.salaryRange !== undefined && { salaryRange: data.salaryRange }),
        ...(data.techStack && { techStack: data.techStack }),
        ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
        ...(data.sourcePlatform !== undefined && { sourcePlatform: data.sourcePlatform }),
        ...(data.isSaved !== undefined && { isSaved: data.isSaved }),
      },
    });

    return updatedJob;
  }

  /**
   * Delete a job
   */
  static async delete(jobId: string, userId: string) {
    // Check if job exists and belongs to user
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId,
      },
    });

    if (!existingJob) {
      throw new Error('Job not found');
    }

    // Delete job (applications will be cascade deleted)
    await prisma.job.delete({
      where: { id: jobId },
    });

    return { message: 'Job deleted successfully' };
  }

  /**
   * Get job statistics for a user
   */
  static async getStatistics(userId: string) {
    const [total, saved, withApplications] = await Promise.all([
      prisma.job.count({
        where: { userId },
      }),
      prisma.job.count({
        where: { userId, isSaved: true },
      }),
      prisma.job.count({
        where: {
          userId,
          applications: {
            some: {},
          },
        },
      }),
    ]);

    return {
      total,
      saved,
      withApplications,
      withoutApplications: total - withApplications,
    };
  }

  /**
   * Search jobs by keyword (searches in company name, position title, and job description)
   */
  static async search(userId: string, keyword: string, limit: number = 10) {
    const jobs = await prisma.job.findMany({
      where: {
        userId,
        OR: [
          {
            companyName: {
              contains: keyword,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            positionTitle: {
              contains: keyword,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            jobDescription: {
              contains: keyword,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jobs;
  }
}
