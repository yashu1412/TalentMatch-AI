export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface HealthResponse {
  success: true;
  message: "API is healthy";
}

export interface ParseResumeRequest {
  resume: File;
}

export interface ParseResumeResponse {
  success: true;
  data: {
    resumeId: string;
    fileName: string;
    parsedResume: import('./resume.types').ParsedResumeDTO;
  };
}

export interface ParseJDTextRequest {
  jobCode: string;
  text: string;
}

export interface ParseJDFileRequest {
  jobCode: string;
  jdFile: File;
}

export interface ParseJDResponse {
  success: true;
  data: {
    jdId: string;
    parsedJD: import('./jd.types').ParsedJDDTO;
  };
}

export interface MatchRequest {
  resumeId: string;
  jobDescriptionId: string;
}

export interface MatchBulkRequest {
  resumeId: string;
  jobDescriptionIds: string[];
}

export interface MatchResponse {
  success: true;
  data: import('./match.types').MatchResponseDTO;
}

export interface HistoryResponse {
  success: true;
  data: Array<{
    matchId: string;
    resumeId: string;
    jobDescriptionId: string;
    matchingScore: number;
    createdAt: string;
  }>;
}

export interface HistoryDetailResponse {
  success: true;
  data: {
    matchId: string;
    result: import('./match.types').MatchResponseDTO;
  };
}
