import { Request, Response } from 'express';
import { CVService } from '../services/cv.service';

/**
 * Create a new CV
 * POST /api/cvs
 */
export const createCV = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cv = await CVService.create({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'CV created successfully',
      data: { cv },
    });
  } catch (error) {
    console.error('Create CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create CV',
    });
  }
};

/**
 * Get all CVs for the authenticated user
 * GET /api/cvs
 */
export const getAllCVs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cvs = await CVService.getAllByUser(userId);

    return res.status(200).json({
      success: true,
      data: { cvs },
    });
  } catch (error) {
    console.error('Get CVs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch CVs',
    });
  }
};

/**
 * Get a single CV by ID
 * GET /api/cvs/:id
 */
export const getCVById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cv = await CVService.getById(id, userId);

    return res.status(200).json({
      success: true,
      data: { cv },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    console.error('Get CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch CV',
    });
  }
};

/**
 * Get default CV for the authenticated user
 * GET /api/cvs/default
 */
export const getDefaultCV = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cv = await CVService.getDefault(userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'No default CV found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { cv },
    });
  } catch (error) {
    console.error('Get default CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch default CV',
    });
  }
};

/**
 * Update a CV
 * PUT /api/cvs/:id
 */
export const updateCV = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cv = await CVService.update(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'CV updated successfully',
      data: { cv },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    console.error('Update CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update CV',
    });
  }
};

/**
 * Set a CV as default
 * PATCH /api/cvs/:id/default
 */
export const setDefaultCV = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cv = await CVService.setDefault(id, userId);

    return res.status(200).json({
      success: true,
      message: 'CV set as default successfully',
      data: { cv },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    console.error('Set default CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set default CV',
    });
  }
};

/**
 * Delete a CV
 * DELETE /api/cvs/:id
 */
export const deleteCV = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await CVService.delete(id, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    console.error('Delete CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete CV',
    });
  }
};

/**
 * Duplicate a CV
 * POST /api/cvs/:id/duplicate
 */
export const duplicateCV = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title } = req.body;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cv = await CVService.duplicate(id, userId, title);

    return res.status(201).json({
      success: true,
      message: 'CV duplicated successfully',
      data: { cv },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    console.error('Duplicate CV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to duplicate CV',
    });
  }
};

/**
 * Get CV statistics
 * GET /api/cvs/statistics
 */
export const getCVStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const statistics = await CVService.getStatistics(userId);

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
