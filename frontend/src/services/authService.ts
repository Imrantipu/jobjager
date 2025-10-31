import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponseData {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponseData> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    await api.post('/auth/logout');
  }
}
