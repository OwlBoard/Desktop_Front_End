// src/services/userApi.ts
import axios from 'axios';

// ✅ Base URL for User Service - matches your FastAPI backend at port 5000
const USER_API_BASE_URL =
  process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:5000/users';

// Configure axios instance
const userApiClient = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  timeout: 10000,
});

// Request/Response interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  message: string;
  id: number;
}

export interface UserOut {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export interface DashboardOut {
  id: number;
  title: string;
  description: string | null;
  owner_id: number;
}

export interface UserUpdateRequest {
  full_name?: string;
  password?: string;
}

// API Service Class
export class UserApiService {
  // ✅ User Registration
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.full_name) {
      formData.append('full_name', userData.full_name);
    }

    const response = await userApiClient.post<AuthResponse>('users/register', formData);
    return response.data;
  }

  // ✅ User Login (Form fields)
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    const response = await userApiClient.post<AuthResponse>('users/login', formData);
    return response.data;
  }

  // Get all users
  static async getAllUsers(): Promise<UserOut[]> {
    const response = await userApiClient.get<UserOut[]>('/users');
    return response.data;
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<UserOut> {
    const response = await userApiClient.get<UserOut>(`/users/${userId}`);
    return response.data;
  }

  // Update user
  static async updateUser(userId: number, updateData: UserUpdateRequest): Promise<UserOut> {
    const response = await userApiClient.put<UserOut>(`/users/${userId}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  // Delete user (soft delete by default)
  static async deleteUser(userId: number, hard: boolean = false): Promise<void> {
    await userApiClient.delete(`/${userId}?hard=${hard}`);
  }

  // Get user dashboards
  static async getUserDashboards(userId: number): Promise<DashboardOut[]> {
    const response = await userApiClient.get<DashboardOut[]>(`/${userId}/dashboards`);
    return response.data;
  }
}

// Convenience functions for easier imports
export const registerUser = UserApiService.register;
export const loginUser = UserApiService.login;
export const getUser = UserApiService.getUserById;
export const getAllUsers = UserApiService.getAllUsers;
export const updateUser = UserApiService.updateUser;
export const deleteUser = UserApiService.deleteUser;
export const getUserDashboards = UserApiService.getUserDashboards;
