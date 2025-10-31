import prisma from '../config/database';
import { ApplicationStatus, Prisma } from '@prisma/client';

// Types
interface CreateApplicationData {
  userId: string;
  jobId: string;
  cvId?: string;
  status?: ApplicationStatus;
  appliedDate?: Date;
  followUpDate?: Date;
  interviewDate?: Date;
  notes?: string;
  contactPerson?: string;
}

interface UpdateApplicationData {
  status?: ApplicationStatus;
  cvId?: string;
  appliedDate?: Date;
  followUpDate?: Date;
  interviewDate?: Date;
  notes?: string;
  contactPerson?: string;
}

interface ApplicationFilters {
  status?: ApplicationStatus;
  companyName?: string;
  positionTitle?: string;
}

export class ApplicationService {
  /**
   * Create a new application
   */
  static async create(data: CreateApplicationData) {
    // Verify job exists and belongs to user
    const job = await prisma.job.findFirst({
      where: {
        id: data.jobId,
        userId: data.userId,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // If cvId provided, verify it exists and belongs to user
    if (data.cvId) {
      const cv = await prisma.cV.findFirst({
        where: {
          id: data.cvId,
          userId: data.userId,
        },
      });

      if (!cv) {
        throw new Error('CV not found');
      }
    }

    const application = await prisma.application.create({
      data: {
        userId: data.userId,
        jobId: data.jobId,
        cvId: data.cvId || null,
        status: data.status || ApplicationStatus.TO_APPLY,
        appliedDate: data.appliedDate || null,
        followUpDate: data.followUpDate || null,
        interviewDate: data.interviewDate || null,
        notes: data.notes || null,
        contactPerson: data.contactPerson || null,
      },
      include: {
        job: true,
        cv: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return application;
  }

  /**
   * Get all applications for a user with optional filters and pagination
   */
  static async getAllByUser(
    userId: string,
    filters?: ApplicationFilters,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      userId,
      ...(filters?.status && {
        status: filters.status,
      }),
      ...(filters?.companyName && {
        job: {
          companyName: {
            contains: filters.companyName,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      }),
      ...(filters?.positionTitle && {
        job: {
          positionTitle: {
            contains: filters.positionTitle,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      }),
    };

    // Get applications and total count in parallel
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          job: true,
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
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single application by ID
   */
  static async getById(applicationId: string, userId: string) {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
      include: {
        job: true,
        cv: true,
        anschreiben: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    return application;
  }

  /**
   * Update an application
   */
  static async update(
    applicationId: string,
    userId: string,
    data: UpdateApplicationData
  ) {
    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!existingApplication) {
      throw new Error('Application not found');
    }

    // If cvId provided, verify it exists and belongs to user
    if (data.cvId) {
      const cv = await prisma.cV.findFirst({
        where: {
          id: data.cvId,
          userId,
        },
      });

      if (!cv) {
        throw new Error('CV not found');
      }
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.cvId !== undefined && { cvId: data.cvId }),
        ...(data.appliedDate !== undefined && { appliedDate: data.appliedDate }),
        ...(data.followUpDate !== undefined && { followUpDate: data.followUpDate }),
        ...(data.interviewDate !== undefined && { interviewDate: data.interviewDate }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson }),
      },
      include: {
        job: true,
        cv: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updatedApplication;
  }

  /**
   * Delete an application
   */
  static async delete(applicationId: string, userId: string) {
    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!existingApplication) {
      throw new Error('Application not found');
    }

    // Delete application
    await prisma.application.delete({
      where: { id: applicationId },
    });

    return { message: 'Application deleted successfully' };
  }

  /**
   * Get application statistics for a user
   */
  static async getStatistics(userId: string) {
    const [
      total,
      toApply,
      applied,
      interview,
      offer,
      rejected,
    ] = await Promise.all([
      prisma.application.count({
        where: { userId },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.TO_APPLY },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.APPLIED },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.INTERVIEW },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.OFFER },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.REJECTED },
      }),
    ]);

    return {
      total,
      byStatus: {
        toApply,
        applied,
        interview,
        offer,
        rejected,
      },
      successRate: total > 0 ? ((offer / total) * 100).toFixed(2) : '0.00',
      interviewRate: total > 0 ? (((interview + offer) / total) * 100).toFixed(2) : '0.00',
    };
  }

  /**
   * Get applications grouped by status (for Kanban board view)
   */
  static async getByStatus(userId: string) {
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: true,
        cv: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by status
    const grouped = {
      TO_APPLY: applications.filter((app) => app.status === ApplicationStatus.TO_APPLY),
      APPLIED: applications.filter((app) => app.status === ApplicationStatus.APPLIED),
      INTERVIEW: applications.filter((app) => app.status === ApplicationStatus.INTERVIEW),
      OFFER: applications.filter((app) => app.status === ApplicationStatus.OFFER),
      REJECTED: applications.filter((app) => app.status === ApplicationStatus.REJECTED),
    };

    return grouped;
  }

  /**
   * Update application status
   */
  static async updateStatus(
    applicationId: string,
    userId: string,
    newStatus: ApplicationStatus
  ) {
    const application = await this.update(applicationId, userId, {
      status: newStatus,
    });

    return application;
  }
}
