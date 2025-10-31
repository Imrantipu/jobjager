import { Request, Response } from 'express';
import { AnschreibenService } from '../services/anschreiben.service';

/**
 * Generate a new Anschreiben using AI
 */
export const generateAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.generate({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Anschreiben generated successfully',
      data: { anschreiben },
    });
  } catch (error: any) {
    console.error('Error generating Anschreiben:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Anschreiben',
    });
  }
};

/**
 * Create a new Anschreiben manually (without AI)
 */
export const createAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.create({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Anschreiben created successfully',
      data: { anschreiben },
    });
  } catch (error: any) {
    console.error('Error creating Anschreiben:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Anschreiben',
    });
  }
};

/**
 * Get all Anschreiben for authenticated user
 */
export const getAllAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Parse filters from query params
    const filters: { isTemplate?: boolean } = {};
    if (req.query.isTemplate !== undefined) {
      filters.isTemplate = req.query.isTemplate === 'true';
    }

    const anschreiben = await AnschreibenService.getAllByUser(userId, filters);

    return res.status(200).json({
      success: true,
      data: {
        anschreiben,
        count: anschreiben.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Anschreiben:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Anschreiben',
    });
  }
};

/**
 * Get a single Anschreiben by ID
 */
export const getAnschreibenById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.getById(id, userId);

    return res.status(200).json({
      success: true,
      data: { anschreiben },
    });
  } catch (error: any) {
    console.error('Error fetching Anschreiben:', error);
    return res.status(error.message === 'Anschreiben not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to fetch Anschreiben',
    });
  }
};

/**
 * Update an Anschreiben
 */
export const updateAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.update(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Anschreiben updated successfully',
      data: { anschreiben },
    });
  } catch (error: any) {
    console.error('Error updating Anschreiben:', error);
    return res.status(error.message === 'Anschreiben not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to update Anschreiben',
    });
  }
};

/**
 * Delete an Anschreiben
 */
export const deleteAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await AnschreibenService.delete(id, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error deleting Anschreiben:', error);
    return res.status(error.message === 'Anschreiben not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to delete Anschreiben',
    });
  }
};

/**
 * Duplicate an Anschreiben
 */
export const duplicateAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.duplicate(
      id,
      userId,
      req.body.title
    );

    return res.status(201).json({
      success: true,
      message: 'Anschreiben duplicated successfully',
      data: { anschreiben },
    });
  } catch (error: any) {
    console.error('Error duplicating Anschreiben:', error);
    return res.status(error.message === 'Anschreiben not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to duplicate Anschreiben',
    });
  }
};

/**
 * Refine/improve an Anschreiben using AI
 */
export const refineAnschreiben = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.refine(
      id,
      userId,
      req.body.improvementInstructions
    );

    return res.status(200).json({
      success: true,
      message: 'Anschreiben refined successfully',
      data: { anschreiben },
    });
  } catch (error: any) {
    console.error('Error refining Anschreiben:', error);
    return res.status(error.message === 'Anschreiben not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to refine Anschreiben',
    });
  }
};

/**
 * Get Anschreiben statistics
 */
export const getAnschreibenStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const statistics = await AnschreibenService.getStatistics(userId);

    return res.status(200).json({
      success: true,
      data: { statistics },
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    });
  }
};

/**
 * Get Anschreiben by application ID
 */
export const getAnschreibenByApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { applicationId } = req.params;

    if (!userId || !applicationId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const anschreiben = await AnschreibenService.getByApplicationId(
      applicationId,
      userId
    );

    return res.status(200).json({
      success: true,
      data: {
        anschreiben,
        count: anschreiben.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Anschreiben by application:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Anschreiben',
    });
  }
};
