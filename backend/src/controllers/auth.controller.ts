import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const data: RegisterInput = req.body;

    const result = await AuthService.register(data);

    // Set JWT token in httpOnly cookie for security
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle known errors (e.g., user already exists)
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }

    // Handle unexpected errors
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
};

/**
 * Login an existing user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const data: LoginInput = req.body;

    const result = await AuthService.login(data);

    // Set JWT token in httpOnly cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle invalid credentials
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
    }

    // Handle unexpected errors
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (_req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User ID is attached to request by auth middleware
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await AuthService.getUserById(userId);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
    });
  }
};
