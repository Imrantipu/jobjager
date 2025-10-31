import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';
import { ApplicationStatus } from '@prisma/client';

/**
 * Create a new application
 * POST /api/applications
 */
export const createApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const application = await ApplicationService.create({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Job not found' || error.message === 'CV not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error('Create application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create application',
    });
  }
};

/**
 * Get all applications for the authenticated user
 * GET /api/applications
 */
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Parse filters
    const filters = {
      status: req.query.status as ApplicationStatus,
      companyName: req.query.companyName as string,
      positionTitle: req.query.positionTitle as string,
    };

    const result = await ApplicationService.getAllByUser(userId, filters, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
};

/**
 * Get a single application by ID
 * GET /api/applications/:id
 */
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const application = await ApplicationService.getById(id, userId);

    return res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.error('Get application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
    });
  }
};

/**
 * Update an application
 * PUT /api/applications/:id
 */
export const updateApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const application = await ApplicationService.update(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: { application },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Application not found' || error.message === 'CV not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error('Update application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application',
    });
  }
};

/**
 * Delete an application
 * DELETE /api/applications/:id
 */
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await ApplicationService.delete(id, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.error('Delete application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application',
    });
  }
};

/**
 * Get application statistics
 * GET /api/applications/statistics
 */
export const getApplicationStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const statistics = await ApplicationService.getStatistics(userId);

    return res.status(200).json({
      success: true,
      data: { statistics },
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};

/**
 * Get applications grouped by status (Kanban view)
 * GET /api/applications/kanban
 */
export const getApplicationsByStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const grouped = await ApplicationService.getByStatus(userId);

    return res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error('Get applications by status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
};

/**
 * Update application status
 * PATCH /api/applications/:id/status
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const application = await ApplicationService.updateStatus(id, userId, status);

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: { application },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    console.error('Update status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
    });
  }
};
