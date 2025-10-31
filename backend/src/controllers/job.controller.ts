import { Request, Response } from 'express';
import { JobService } from '../services/job.service';

/**
 * Create a new job
 * POST /api/jobs
 */
export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const job = await JobService.create({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job',
    });
  }
};

/**
 * Get all jobs for the authenticated user
 * GET /api/jobs
 */
export const getAllJobs = async (req: Request, res: Response) => {
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
    const filters: {
      companyName?: string;
      positionTitle?: string;
      location?: string;
      techStack?: string[];
      isSaved?: boolean;
    } = {};

    if (req.query.companyName) {
      filters.companyName = req.query.companyName as string;
    }
    if (req.query.positionTitle) {
      filters.positionTitle = req.query.positionTitle as string;
    }
    if (req.query.location) {
      filters.location = req.query.location as string;
    }
    if (req.query.techStack) {
      filters.techStack = (req.query.techStack as string).split(',');
    }
    if (req.query.isSaved !== undefined) {
      filters.isSaved = req.query.isSaved === 'true';
    }

    const result = await JobService.getAllByUser(userId, filters, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
    });
  }
};

/**
 * Get a single job by ID
 * GET /api/jobs/:id
 */
export const getJobById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const job = await JobService.getById(id, userId);

    return res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    console.error('Get job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
    });
  }
};

/**
 * Update a job
 * PUT /api/jobs/:id
 */
export const updateJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const job = await JobService.update(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    console.error('Update job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job',
    });
  }
};

/**
 * Delete a job
 * DELETE /api/jobs/:id
 */
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await JobService.delete(id, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Job not found') {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    console.error('Delete job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete job',
    });
  }
};

/**
 * Get job statistics
 * GET /api/jobs/statistics
 */
export const getJobStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const statistics = await JobService.getStatistics(userId);

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
 * Search jobs by keyword
 * GET /api/jobs/search
 */
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { q } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search keyword is required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const jobs = await JobService.search(userId, q, limit);

    return res.status(200).json({
      success: true,
      data: { jobs },
    });
  } catch (error) {
    console.error('Search jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
    });
  }
};
