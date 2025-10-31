import prisma from '../config/database';
import { Prisma } from '@prisma/client';

// Types for CV sections
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  nationality?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  summary?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements?: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  description?: string;
}

interface Skill {
  id: string;
  category: string;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Language {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';
  description?: string;
}

// Service types
interface CreateCVData {
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  languages?: Language[];
  isDefault?: boolean;
}

interface UpdateCVData {
  title?: string;
  personalInfo?: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  languages?: Language[];
  isDefault?: boolean;
}

export class CVService {
  /**
   * Create a new CV
   */
  static async create(data: CreateCVData) {
    // If this is marked as default, unset any existing default CV for this user
    if (data.isDefault) {
      await prisma.cV.updateMany({
        where: {
          userId: data.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const cv = await prisma.cV.create({
      data: {
        userId: data.userId,
        title: data.title,
        personalInfo: data.personalInfo as unknown as Prisma.InputJsonValue,
        experience: (data.experience || []) as unknown as Prisma.InputJsonValue,
        education: (data.education || []) as unknown as Prisma.InputJsonValue,
        skills: (data.skills || []) as unknown as Prisma.InputJsonValue,
        languages: (data.languages || []) as unknown as Prisma.InputJsonValue,
        isDefault: data.isDefault || false,
      },
    });

    return cv;
  }

  /**
   * Get all CVs for a user
   */
  static async getAllByUser(userId: string) {
    const cvs = await prisma.cV.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        personalInfo: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        applications: {
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

    return cvs;
  }

  /**
   * Get a single CV by ID
   */
  static async getById(cvId: string, userId: string) {
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId,
      },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                companyName: true,
                positionTitle: true,
              },
            },
          },
        },
      },
    });

    if (!cv) {
      throw new Error('CV not found');
    }

    return cv;
  }

  /**
   * Get default CV for a user
   */
  static async getDefault(userId: string) {
    const cv = await prisma.cV.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    return cv;
  }

  /**
   * Update a CV
   */
  static async update(cvId: string, userId: string, data: UpdateCVData) {
    // Check if CV exists and belongs to user
    const existingCV = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId,
      },
    });

    if (!existingCV) {
      throw new Error('CV not found');
    }

    // If setting as default, unset other default CVs
    if (data.isDefault) {
      await prisma.cV.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: cvId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update CV
    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.personalInfo && { personalInfo: data.personalInfo as unknown as Prisma.InputJsonValue }),
        ...(data.experience !== undefined && { experience: data.experience as unknown as Prisma.InputJsonValue }),
        ...(data.education !== undefined && { education: data.education as unknown as Prisma.InputJsonValue }),
        ...(data.skills !== undefined && { skills: data.skills as unknown as Prisma.InputJsonValue }),
        ...(data.languages !== undefined && { languages: data.languages as unknown as Prisma.InputJsonValue }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    return updatedCV;
  }

  /**
   * Set a CV as default
   */
  static async setDefault(cvId: string, userId: string) {
    // Check if CV exists and belongs to user
    const existingCV = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId,
      },
    });

    if (!existingCV) {
      throw new Error('CV not found');
    }

    // Unset other default CVs
    await prisma.cV.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set this CV as default
    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: { isDefault: true },
    });

    return updatedCV;
  }

  /**
   * Delete a CV
   */
  static async delete(cvId: string, userId: string) {
    // Check if CV exists and belongs to user
    const existingCV = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId,
      },
    });

    if (!existingCV) {
      throw new Error('CV not found');
    }

    // Delete CV (applications will have cv_id set to NULL)
    await prisma.cV.delete({
      where: { id: cvId },
    });

    return { message: 'CV deleted successfully' };
  }

  /**
   * Duplicate a CV
   */
  static async duplicate(cvId: string, userId: string, newTitle?: string) {
    // Get original CV
    const originalCV = await this.getById(cvId, userId);

    // Create duplicate
    const duplicateCV = await prisma.cV.create({
      data: {
        userId,
        title: newTitle || `${originalCV.title} (Copy)`,
        personalInfo: originalCV.personalInfo as unknown as Prisma.InputJsonValue,
        experience: originalCV.experience as unknown as Prisma.InputJsonValue,
        education: originalCV.education as unknown as Prisma.InputJsonValue,
        skills: originalCV.skills as unknown as Prisma.InputJsonValue,
        languages: originalCV.languages as unknown as Prisma.InputJsonValue,
        isDefault: false,
      },
    });

    return duplicateCV;
  }

  /**
   * Get CV statistics for a user
   */
  static async getStatistics(userId: string) {
    const [total, defaultCV, withApplications] = await Promise.all([
      prisma.cV.count({
        where: { userId },
      }),
      prisma.cV.findFirst({
        where: { userId, isDefault: true },
        select: { id: true, title: true },
      }),
      prisma.cV.count({
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
      defaultCV,
      withApplications,
      withoutApplications: total - withApplications,
    };
  }
}
