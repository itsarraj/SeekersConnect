import { AUTH_API_URL, AUTH_API_VERSION } from '@/constants/config';
import { getAccessToken } from '@/lib/auth-storage';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  email_verification_token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

class AuthApiService {
  private getFullUrl(endpoint: string): string {
    return `${AUTH_API_URL}/api/${AUTH_API_VERSION}${endpoint}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(endpoint);
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: 'NetworkError',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || errorData.error);
    }
    return response.json();
  }

  private async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(data: LogoutRequest): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const url = this.getFullUrl(`/auth/verify-email/${encodeURIComponent(token)}`);
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: 'NetworkError',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || errorData.error);
    }
    return response.json();
  }

  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.authenticatedRequest<UserProfile>('/user/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authApi = new AuthApiService();
