'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { ProgressOverviewResponse, StepType } from '../backend/schema';

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

export const useProgressOverview = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.get<ApiResponse<ProgressOverviewResponse>>('/api/progress', {
        headers: { Authorization: authHeader },
      });
      return response.data.data;
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ progressId, stepType }: {
      progressId: string;
      stepType: StepType;
    }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<{
        nextStep: StepType | null;
        moduleCompleted: boolean;
        unlockedModule: string | null;
      }>>(
        `/api/progress/${progressId}/complete-step`,
        { stepType },
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
};

export const useUserProgress = useProgressOverview;
