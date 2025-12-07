'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { ModulesListResponse, ModuleDetailResponse, StartModuleResponse } from '../backend/schema';

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

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.get<ApiResponse<ModulesListResponse>>('/api/modules', {
        headers: { Authorization: authHeader },
      });
      return response.data.data;
    },
  });
};

export const useModule = (moduleId: string) => {
  return useQuery({
    queryKey: ['modules', moduleId],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.get<ApiResponse<ModuleDetailResponse>>(`/api/modules/${moduleId}`, {
        headers: { Authorization: authHeader },
      });
      return response.data.data;
    },
    enabled: !!moduleId,
  });
};

export const useStartModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<StartModuleResponse>>(
        `/api/modules/${moduleId}/start`,
        {},
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};
