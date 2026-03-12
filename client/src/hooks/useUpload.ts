import { useState, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';

export interface UseUploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const uploadFile = useCallback(async (
    file: File,
    endpoint: 'resume' | 'jd',
    additionalData: Record<string, any> = {}
  ) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);
    setData(null);

    try {
      // Simulate progress (since we don't have actual progress from fetch)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      let response: ApiResponse<any>;

      if (endpoint === 'resume') {
        response = await apiClient.parseResumeFromFile(file);
      } else {
        response = await apiClient.parseJDFromFile(file, additionalData.jobCode);
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setData(response.data);
        options.onSuccess?.(response.data);
      } else {
        setError(response.error || 'Upload failed');
        options.onError?.(response.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setData(null);
  }, []);

  return {
    isUploading,
    progress,
    error,
    data,
    uploadFile,
    reset,
  };
}
