'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

interface UserProgress {
  id: string;
  moduleId: string;
  moduleTitle: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: string | null;
  stepsCompleted: number;
  totalSteps: number;
  startedAt: string;
  completedAt: string | null;
}

interface ProgressStats {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
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

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.get<ApiResponse<{
        progress: UserProgress[];
        stats: ProgressStats;
      }>>('/api/progress', {
        headers: { Authorization: authHeader },
      });
      return response.data.data;
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ progressId, stepData }: {
      progressId: string;
      stepData?: Record<string, unknown>;
    }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<{
        nextStep: string | null;
        isModuleComplete: boolean;
        earnedBadges: string[];
      }>>(
        `/api/progress/${progressId}/complete-step`,
        { stepData },
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
