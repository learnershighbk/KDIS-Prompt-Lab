'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

interface SocraticResponse {
  message: string;
  canProceed?: boolean;
}

interface PromptAnalysis {
  strengths: string[];
  improvements: string[];
  score: number;
  feedback: string;
}

interface ComparisonResult {
  responseA: string;
  responseB: string;
  analysis: string;
  betterPrompt: 'A' | 'B';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

const getAuthHeader = async () => {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : '';
};

export const useSocraticChat = () => {
  return useMutation({
    mutationFn: async (data: {
      moduleId: string;
      userMessage: string;
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<SocraticResponse>>(
        '/api/ai/socratic',
        data,
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
  });
};

export const useAnalyzePrompt = () => {
  return useMutation({
    mutationFn: async (data: {
      moduleId: string;
      prompt: string;
      scenarioContext?: string;
    }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<PromptAnalysis>>(
        '/api/ai/analyze-prompt',
        data,
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
  });
};

export const useComparePrompts = () => {
  return useMutation({
    mutationFn: async (data: {
      moduleId: string;
      promptA: string;
      promptB: string;
    }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<ComparisonResult>>(
        '/api/ai/compare',
        data,
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
  });
};
