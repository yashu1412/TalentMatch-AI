const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ParseResumeRequest {
  file?: File;
  text?: string;
}

export interface ParseJDRequest {
  text?: string;
  file?: File;
}

export interface MatchRequest {
  resumeText: string;
  jdText: string;
  jobCode?: string;
}

export interface MatchBulkRequest {
  resumeText: string;
  jdTexts: Array<{ text: string; jobCode: string }>;
}

export interface ParsedResume {
  name: string;
  email?: string;
  phone?: string;
  resumeSkills: string[];
  yearOfExperience: number | null;
  education?: string[];
  workHistory?: Array<{
    company: string;
    role: string;
    duration: string;
  }>;
}

export interface ParsedJD {
  jobId: string;
  role: string;
  salary?: string;
  yearOfExperience: number | null;
  requiredSkills: string[];
  optionalSkills: string[];
  allSkills: string[];
  aboutRole?: string;
  location?: string;
  employmentType?: string;
}

export interface MatchResult {
  name: string;
  salary?: string;
  yearOfExperience: number | null;
  resumeSkills: string[];
  matchingJobs: Array<{
    jobId: string;
    role: string;
    aboutRole?: string;
    skillsAnalysis: Array<{
      skill: string;
      presentInResume: boolean;
    }>;
    matchingScore: number;
  }>;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Backend may already wrap responses as { success, data, error }
      if (data && typeof data === 'object' && 'success' in data) {
        const apiData = data as ApiResponse<T>;
        if (!apiData.success) {
          return { success: false, error: apiData.error || 'Request failed' };
        }
        return { success: true, data: apiData.data as T };
      }

      // Fallback: treat raw JSON as the data payload
      return { success: true, data: data as T };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Backend may already wrap responses as { success, data, error }
      if (data && typeof data === 'object' && 'success' in data) {
        const apiData = data as ApiResponse<T>;
        if (!apiData.success) {
          return { success: false, error: apiData.error || 'Upload failed' };
        }
        return { success: true, data: apiData.data as T };
      }

      // Fallback: treat raw JSON as the data payload
      return { success: true, data: data as T };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/api/health');
  }

  // Resume parsing
  async parseResumeFromText(text: string): Promise<ApiResponse<ParsedResume>> {
    return this.request('/api/parse/resume/text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async parseResumeFromFile(file: File): Promise<ApiResponse<ParsedResume>> {
    return this.uploadFile('/api/parse/resume/file', file);
  }

  // Job description parsing
  async parseJDFromText(text: string, jobCode?: string): Promise<ApiResponse<ParsedJD>> {
    return this.request('/api/parse/jd/text', {
      method: 'POST',
      body: JSON.stringify({ text, jobCode }),
    });
  }

  async parseJDFromFile(file: File, jobCode?: string): Promise<ApiResponse<ParsedJD>> {
    return this.uploadFile('/api/parse/jd/file', file, { jobCode });
  }

  // Matching
  async matchResumeToJD(request: MatchRequest): Promise<ApiResponse<MatchResult>> {
    return this.request('/api/match/single', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async matchResumeToMultipleJD(request: MatchBulkRequest): Promise<ApiResponse<MatchResult>> {
    return this.request('/api/match/bulk', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // History management
  async getHistory(): Promise<ApiResponse<any[]>> {
    return this.request('/api/history');
  }

  async saveToHistory(matchData: any): Promise<ApiResponse<any>> {
    return this.request('/api/history', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async deleteHistoryEntry(entryId?: string): Promise<ApiResponse<any>> {
    const url = entryId ? `/api/history?id=${entryId}` : '/api/history';
    return this.request(url, {
      method: 'DELETE',
    });
  }

  async getHistoryDetail(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/history/${id}`);
  }
}

export const apiClient = new ApiClient();

// Helper functions for common operations
export const parseResume = async (file?: File, text?: string): Promise<ApiResponse<ParsedResume>> => {
  if (file) {
    return apiClient.parseResumeFromFile(file);
  } else if (text) {
    return apiClient.parseResumeFromText(text);
  }
  return { success: false, error: 'Either file or text must be provided' };
};

export const parseJD = async (file?: File, text?: string, jobCode?: string): Promise<ApiResponse<ParsedJD>> => {
  if (file) {
    return apiClient.parseJDFromFile(file, jobCode);
  } else if (text) {
    return apiClient.parseJDFromText(text, jobCode);
  }
  return { success: false, error: 'Either file or text must be provided' };
};

export const matchResume = async (resumeText: string, jdText: string, jobCode?: string): Promise<ApiResponse<MatchResult>> => {
  return apiClient.matchResumeToJD({ resumeText, jdText, jobCode });
};
