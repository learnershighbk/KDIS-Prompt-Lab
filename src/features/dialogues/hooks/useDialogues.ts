'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Dialogue {
  id: string;
  progressId: string;
  moduleId: string;
  status: 'active' | 'completed';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
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

export const useDialogue = (dialogueId: string) => {
  return useQuery({
    queryKey: ['dialogues', dialogueId],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.get<ApiResponse<Dialogue>>(`/api/dialogues/${dialogueId}`, {
        headers: { Authorization: authHeader },
      });
      return response.data.data;
    },
    enabled: !!dialogueId,
  });
};

export const useCreateDialogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { progressId: string; scenarioId?: string }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<Dialogue>>(
        '/api/dialogues',
        data,
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dialogues'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dialogueId, content }: { dialogueId: string; content: string }) => {
      const authHeader = await getAuthHeader();
      const response = await apiClient.post<ApiResponse<{ userMessage: Message; assistantMessage: Message }>>(
        `/api/dialogues/${dialogueId}/messages`,
        { content },
        { headers: { Authorization: authHeader } }
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dialogues', variables.dialogueId] });
    },
  });
};
