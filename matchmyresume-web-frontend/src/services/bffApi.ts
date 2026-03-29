import { tryRefreshAuth } from './authRefresh';

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content?: any;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateResumeRequest {
  title: string;
  content: any;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface Job {
  id: string;
  company_name: string;
  company_logo_url?: string;
  position_title: string;
  location: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  description?: string;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export interface JobPageResponse {
  jobs: Job[];
  total_count: number;
  page: number;
  total_pages: number;
}

export interface Stats {
  live_jobs: number;
  companies: number;
  candidates: number;
  new_jobs: number;
  updated_at?: string;
}

export interface JobFilter {
  location?: string;
  employment_type?: string;
  salary_min?: number;
  salary_period?: string;
  posted_within_days?: number;
  page?: number;
  limit?: number;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  about?: string;
  industry?: string;
  employee_size?: string;
  head_office?: string;
  company_type?: string;
  since?: number;
  specialization?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  logo_url?: string;
  website?: string;
  about?: string;
  industry?: string;
  employee_size?: string;
  head_office?: string;
  company_type?: string;
  since?: number;
  specialization?: string[];
}

export interface CreateJobRequest {
  company_id: string;
  position_title: string;
  location: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  description?: string;
  requirements?: string;
  facilities?: string;
  tags?: string[];
}

class BffApiService {
  private baseURL: string;
  private apiVersion: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_BFF_API_URL || 'http://localhost:8080';
    this.apiVersion = import.meta.env.VITE_BFF_API_VERSION || 'v1';
  }

  private getFullUrl(endpoint: string): string {
    return `${this.baseURL}/api/${this.apiVersion}${endpoint}`;
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
    options: RequestInit = {},
    userId?: string,
    isRetry = false
  ): Promise<T> {
    const accessToken = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY || 'matchmyresume_access_token');

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      'Authorization': `Bearer ${accessToken}`,
    };
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const url = this.getFullUrl(endpoint);
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401 && !isRetry) {
      try {
        await tryRefreshAuth();
        return this.authenticatedRequest<T>(endpoint, options, userId, true);
      } catch {
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: 'NetworkError',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || errorData.error);
    }

    return response.json();
  }

  // ===== HEALTH ENDPOINT =====

  async checkHealth(): Promise<string> {
    const url = this.getFullUrl('/health');
    const response = await fetch(url);
    return response.text();
  }

  async getStats(): Promise<Stats> {
    return this.request<Stats>('/stats');
  }

  // ===== RESUME ENDPOINTS =====
  // userId required - pass from useAuth().user.id

  async getResumes(userId: string): Promise<Resume[]> {
    return this.authenticatedRequest<Resume[]>('/resumes', {}, userId);
  }

  async createResume(userId: string, data: CreateResumeRequest): Promise<Resume> {
    return this.authenticatedRequest<Resume>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }, userId);
  }

  async uploadResume(userId: string, file: File, isRetry = false): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);

    const url = this.getFullUrl('/resumes/upload');
    const accessToken = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY || 'matchmyresume_access_token');
    if (!accessToken) throw new Error('No access token available');

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'X-User-Id': userId,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401 && !isRetry) {
      try {
        await tryRefreshAuth();
        return this.uploadResume(userId, file, true);
      } catch {
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Upload failed', message: response.statusText }));
      const msg = err.message || err.error || 'Upload failed';
      throw new Error(typeof msg === 'string' ? msg : 'Upload failed');
    }
    return response.json();
  }

  async getResume(userId: string, id: string): Promise<Resume> {
    return this.authenticatedRequest<Resume>(`/resumes/${id}`, {}, userId);
  }

  async updateResume(userId: string, id: string, data: Partial<CreateResumeRequest>): Promise<Resume> {
    return this.authenticatedRequest<Resume>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, userId);
  }

  async deleteResume(userId: string, id: string): Promise<{ message: string }> {
    return this.authenticatedRequest<{ message: string }>(`/resumes/${id}`, {
      method: 'DELETE',
    }, userId);
  }

  // ===== APPLICATION ENDPOINTS =====

  async getMyApplications(userId: string): Promise<Application[]> {
    return this.authenticatedRequest<Application[]>('/applications', {}, userId);
  }

  async applyToJob(userId: string, jobId: string): Promise<Application> {
    return this.authenticatedRequest<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    }, userId);
  }

  async getJobApplications(userId: string, jobId: string): Promise<Application[]> {
    return this.authenticatedRequest<Application[]>(`/applications/job/${jobId}`, {}, userId);
  }

  async updateApplication(userId: string, id: string, status: string): Promise<Application> {
    return this.authenticatedRequest<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, userId);
  }

  // ===== JOB ENDPOINTS =====

  async getJobs(filter: JobFilter = {}): Promise<JobPageResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    const query = queryParams.toString();
    return this.request<JobPageResponse>(`/jobs${query ? `?${query}` : ''}`);
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async getSuggestedJobs(userId: string): Promise<Job[]> {
    return this.authenticatedRequest<Job[]>(`/jobs/suggested/${userId}`);
  }

  // ===== RECRUITER ENDPOINTS =====

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    return this.authenticatedRequest<Company>('/recruiter/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCompany(id: string): Promise<Company> {
    return this.authenticatedRequest<Company>(`/recruiter/companies/${id}`);
  }

  async createJob(data: CreateJobRequest): Promise<Job> {
    return this.authenticatedRequest<Job>('/recruiter/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== EMPLOYER PROFILE (BFF-owned, auth has only email/name/password) =====

  async upsertEmployerProfile(data: CreateEmployerProfileRequest): Promise<EmployerProfile> {
    return this.authenticatedRequest<EmployerProfile>('/employer-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmployerProfile(): Promise<EmployerProfile | null> {
    try {
      return await this.authenticatedRequest<EmployerProfile>('/employer-profiles/me');
    } catch {
      return null;
    }
  }

  async getEmployerCompany(): Promise<Company | null> {
    try {
      return await this.authenticatedRequest<Company>('/employer-profiles/me/company');
    } catch {
      return null;
    }
  }

  // ===== CANDIDATE PROFILE (BFF-owned) =====

  async upsertCandidateProfile(data: CreateCandidateProfileRequest = {}): Promise<CandidateProfile> {
    return this.authenticatedRequest<CandidateProfile>('/candidate-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCandidateProfile(): Promise<CandidateProfile | null> {
    try {
      return await this.authenticatedRequest<CandidateProfile>('/candidate-profiles/me');
    } catch {
      return null;
    }
  }
}

export interface EmployerProfile {
  user_id: string;
  company_name: string;
  company_id?: string;
  job_title?: string;
  mobile?: string;
  company_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployerProfileRequest {
  company_name: string;
  company_id?: string;
  job_title?: string;
  mobile?: string;
  company_type: string;
}

export interface CandidateProfile {
  user_id: string;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCandidateProfileRequest {
  bio?: string | null;
}

export const bffApi = new BffApiService();
