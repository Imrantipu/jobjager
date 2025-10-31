import prisma from '../config/database';
import { AIService } from './ai.service';

interface GenerateAnschreibenData {
  userId: string;
  applicationId?: string;
  jobDescription: string;
  companyName: string;
  positionTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  experience?: string;
  skills?: string;
  education?: string;
  motivation?: string;
  saveAsTemplate?: boolean;
}

interface CreateAnschreibenData {
  userId: string;
  applicationId?: string;
  title: string;
  content: string;
  isTemplate?: boolean;
}

interface UpdateAnschreibenData {
  title?: string;
  content?: string;
  isTemplate?: boolean;
  applicationId?: string;
}

export class AnschreibenService {
  /**
   * Generate a new Anschreiben using AI
   */
  static async generate(data: GenerateAnschreibenData) {
    // Check if AI is configured
    if (!AIService.isConfigured()) {
      throw new Error(
        'AI service is not configured. Please add ANTHROPIC_API_KEY to your environment variables.'
      );
    }

    // Generate cover letter using AI
    const content = await AIService.generateCoverLetter({
      jobDescription: data.jobDescription,
      companyName: data.companyName,
      positionTitle: data.positionTitle,
      applicantName: data.applicantName,
      applicantEmail: data.applicantEmail,
      applicantPhone: data.applicantPhone,
      experience: data.experience,
      skills: data.skills,
      education: data.education,
      motivation: data.motivation,
    });

    // Create title from position and company
    const title = `Anschreiben - ${data.positionTitle} bei ${data.companyName}`;

    // Save to database
    const anschreiben = await prisma.anschreiben.create({
      data: {
        userId: data.userId,
        applicationId: data.applicationId || null,
        title,
        content,
        isTemplate: data.saveAsTemplate || false,
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    return anschreiben;
  }

  /**
   * Create an Anschreiben manually (without AI)
   */
  static async create(data: CreateAnschreibenData) {
    const anschreiben = await prisma.anschreiben.create({
      data: {
        userId: data.userId,
        applicationId: data.applicationId || null,
        title: data.title,
        content: data.content,
        isTemplate: data.isTemplate || false,
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    return anschreiben;
  }

  /**
   * Get all Anschreiben for a user
   */
  static async getAllByUser(userId: string, filters?: { isTemplate?: boolean }) {
    const whereClause: any = { userId };

    if (filters?.isTemplate !== undefined) {
      whereClause.isTemplate = filters.isTemplate;
    }

    const anschreiben = await prisma.anschreiben.findMany({
      where: whereClause,
      orderBy: [
        { isTemplate: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        isTemplate: true,
        createdAt: true,
        updatedAt: true,
        application: {
          select: {
            id: true,
            status: true,
            job: {
              select: {
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    return anschreiben;
  }

  /**
   * Get a single Anschreiben by ID
   */
  static async getById(anschreibenId: string, userId: string) {
    const anschreiben = await prisma.anschreiben.findFirst({
      where: {
        id: anschreibenId,
        userId,
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                companyName: true,
                positionTitle: true,
                jobDescription: true,
              },
            },
          },
        },
      },
    });

    if (!anschreiben) {
      throw new Error('Anschreiben not found');
    }

    return anschreiben;
  }

  /**
   * Update an Anschreiben
   */
  static async update(anschreibenId: string, userId: string, data: UpdateAnschreibenData) {
    // Check if Anschreiben exists and belongs to user
    const existing = await prisma.anschreiben.findFirst({
      where: {
        id: anschreibenId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Anschreiben not found');
    }

    // Update Anschreiben
    const updated = await prisma.anschreiben.update({
      where: { id: anschreibenId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.isTemplate !== undefined && { isTemplate: data.isTemplate }),
        ...(data.applicationId !== undefined && { applicationId: data.applicationId || null }),
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete an Anschreiben
   */
  static async delete(anschreibenId: string, userId: string) {
    // Check if Anschreiben exists and belongs to user
    const existing = await prisma.anschreiben.findFirst({
      where: {
        id: anschreibenId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Anschreiben not found');
    }

    // Delete Anschreiben
    await prisma.anschreiben.delete({
      where: { id: anschreibenId },
    });

    return { message: 'Anschreiben deleted successfully' };
  }

  /**
   * Duplicate an Anschreiben
   */
  static async duplicate(anschreibenId: string, userId: string, newTitle?: string) {
    // Get original Anschreiben
    const original = await this.getById(anschreibenId, userId);

    // Create duplicate
    const duplicate = await prisma.anschreiben.create({
      data: {
        userId,
        title: newTitle || `${original.title} (Copy)`,
        content: original.content,
        isTemplate: original.isTemplate,
        applicationId: null, // Don't link duplicate to same application
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    return duplicate;
  }

  /**
   * Refine/improve an existing Anschreiben using AI
   */
  static async refine(
    anschreibenId: string,
    userId: string,
    improvementInstructions: string
  ) {
    // Check if AI is configured
    if (!AIService.isConfigured()) {
      throw new Error(
        'AI service is not configured. Please add ANTHROPIC_API_KEY to your environment variables.'
      );
    }

    // Get existing Anschreiben
    const existing = await this.getById(anschreibenId, userId);

    // Generate improved version using AI
    const improvedContent = await AIService.refineCoverLetter(
      existing.content,
      improvementInstructions
    );

    // Update the Anschreiben with improved content
    const updated = await prisma.anschreiben.update({
      where: { id: anschreibenId },
      data: {
        content: improvedContent,
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get Anschreiben statistics for a user
   */
  static async getStatistics(userId: string) {
    const [total, templates, linkedToApplications] = await Promise.all([
      prisma.anschreiben.count({
        where: { userId },
      }),
      prisma.anschreiben.count({
        where: { userId, isTemplate: true },
      }),
      prisma.anschreiben.count({
        where: {
          userId,
          applicationId: { not: null },
        },
      }),
    ]);

    return {
      total,
      templates,
      linkedToApplications,
      notLinked: total - linkedToApplications,
    };
  }

  /**
   * Get Anschreiben by application ID
   */
  static async getByApplicationId(applicationId: string, userId: string) {
    const anschreiben = await prisma.anschreiben.findMany({
      where: {
        applicationId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return anschreiben;
  }
}
