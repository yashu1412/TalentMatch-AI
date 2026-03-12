"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  resumeName: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  skillsMatched: number;
  totalSkills: number;
  status: string;
  matchData?: any;
}

export function useHistory() {
  const { isSignedIn, userId } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history when user signs in
  useEffect(() => {
    if (isSignedIn && userId) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [isSignedIn, userId]);

  const loadHistory = async () => {
    if (!isSignedIn) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getHistory();
      if (response.success && response.data) {
        setHistory(response.data);
      } else {
        setError(response.error || 'Failed to load history');
      }
    } catch (err) {
      setError('Failed to load history');
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (matchData: any): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const response = await apiClient.saveToHistory(matchData);
      if (response.success) {
        // Refresh history after saving
        await loadHistory();
        return true;
      } else {
        setError(response.error || 'Failed to save to history');
        return false;
      }
    } catch (err) {
      setError('Failed to save to history');
      console.error('History save error:', err);
      return false;
    }
  };

  const deleteEntry = async (entryId?: string): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const response = await apiClient.deleteHistoryEntry(entryId);
      if (response.success) {
        // Refresh history after deletion
        await loadHistory();
        return true;
      } else {
        setError(response.error || 'Failed to delete entry');
        return false;
      }
    } catch (err) {
      setError('Failed to delete entry');
      console.error('History delete error:', err);
      return false;
    }
  };

  const clearHistory = async (): Promise<boolean> => {
    return deleteEntry(); // Call without entryId to clear all
  };

  return {
    history,
    loading,
    error,
    loadHistory,
    saveToHistory,
    deleteEntry,
    clearHistory,
    canSave: isSignedIn
  };
}
