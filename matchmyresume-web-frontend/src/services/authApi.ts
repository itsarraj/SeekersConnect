// API types based on Universal Auth Service
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

function resolveAuthBaseUrl(envValue: string | undefined): string {
  if (!envValue || envValue === '__RELATIVE__') {
    return '';
  }
  return envValue.replace(/\/$/, '');
}

class AuthApiService {
  private baseURL: string;
  private apiVersion: string;

  constructor() {
    const raw = (import.meta.env.VITE_AUTH_API_URL ||
      import.meta.env.VITE_API_BASE_URL) as string | undefined;
    this.baseURL = resolveAuthBaseUrl(raw);
    if (!this.baseURL && import.meta.env.DEV) {
      this.baseURL = 'http://localhost:8000';
    }
    this.apiVersion =
      import.meta.env.VITE_AUTH_API_VERSION || import.meta.env.VITE_API_VERSION || 'v1';
  }

  private getFullUrl(endpoint: string): string {
    const base = this.baseURL;
    const path = `/api/${this.apiVersion}${endpoint}`;
    return base ? `${base}${path}` : path;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.getFullUrl(endpoint);

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({
          error: 'NetworkError',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.message || errorData.error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY || 'matchmyresume_access_token');

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    };

    return this.request<T>(endpoint, config);
  }

  // ===== AUTH ENDPOINTS =====

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
    return this.request<{ message: string }>(`/auth/verify-email/${token}`);
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

  // ===== USER ENDPOINTS =====

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