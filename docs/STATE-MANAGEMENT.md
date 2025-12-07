# Prompt Lab 상태 관리

> **타입 참조**: 모든 도메인 엔티티 및 스토어 타입은 `TYPE-DEFINITIONS.md`를 단일 소스로 사용합니다.  
> 이 문서의 인라인 타입 정의는 설명 목적이며, 실제 구현 시 `src/domain/entities/`, `src/types/`, `src/stores/types.ts` 경로를 사용하세요.

## 1. 상태 관리 전략

### 1.1 상태 분류

| 상태 유형 | 관리 방식 | 예시 |
|-----------|-----------|------|
| 서버 상태 | React Query | 모듈 목록, 사용자 정보 |
| 클라이언트 상태 | Zustand | 인증 상태, UI 상태 |
| URL 상태 | Next.js Router | 페이지 파라미터, 쿼리 |
| 폼 상태 | React Hook Form | 로그인 폼, 성찰 폼 |

### 1.2 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ useAuth()   │  │ useModule() │  │ useDialogue()│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
├─────────┼────────────────┼────────────────┼─────────────────┤
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Auth Store  │  │ React Query │  │ Dialogue    │         │
│  │ (Zustand)   │  │ (Server)    │  │ Store       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Persistence Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Local       │  │ Supabase    │  │ Session     │         │
│  │ Storage     │  │ (Server)    │  │ Storage     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 2. Zustand Stores

> **참조**: AGENTS.md 디렉토리 구조 기준. 피처별 스토어는 `src/features/[feature]/stores/` 에 위치

### 2.1 Auth Store

```typescript
// src/features/auth/stores/auth.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/browser-client';
import type { UserWithProfile, Session } from '@/domain/entities/user.entity';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';

interface AuthState {
  // State
  user: UserWithProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserWithProfile['profile']>) => Promise<void>;
  clearError: () => void;
  setUser: (user: UserWithProfile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) throw error;

          // 프로필 및 역할 조회
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id);

          const userWithProfile: UserWithProfile = {
            id: data.user.id,
            email: data.user.email!,
            createdAt: new Date(data.user.created_at),
            profile: profile!,
            roles: roles?.map((r) => r.role) || ['student'],
          };

          set({
            user: userWithProfile,
            session: {
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              expiresAt: data.session.expires_at!,
              user: userWithProfile,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                student_id: data.studentId,
                preferred_language: data.preferredLanguage || 'ko',
              },
            },
          });

          if (error) throw error;
          
          set({ isLoading: false });
          // 이메일 확인 후 로그인 필요
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshSession: async () => {
        const supabase = createClient();
        const { data } = await supabase.auth.refreshSession();
        
        if (data.session && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id);

          const userWithProfile: UserWithProfile = {
            id: data.user.id,
            email: data.user.email!,
            createdAt: new Date(data.user.created_at),
            profile: profile!,
            roles: roles?.map((r) => r.role) || ['student'],
          };

          set({
            user: userWithProfile,
            session: {
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              expiresAt: data.session.expires_at!,
              user: userWithProfile,
            },
            isAuthenticated: true,
          });
        }
      },

      updateProfile: async (updates) => {
        const user = get().user;
        if (!user) return;

        const supabase = createClient();
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;

        set({
          user: {
            ...user,
            profile: { ...user.profile, ...updates },
          },
        });
      },

      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 2.2 Progress Store

```typescript
// src/features/progress/stores/progress.store.ts

import { create } from 'zustand';
import type { 
  UserProgress, 
  OverallProgress, 
  StepType 
} from '@/domain/entities/progress.entity';
import type { BadgeWithModule } from '@/domain/entities/badge.entity';
import { apiClient } from '@/lib/remote/api-client';

interface ProgressState {
  // State
  currentProgress: UserProgress | null;
  overallProgress: OverallProgress | null;
  moduleProgresses: Map<string, UserProgress>;
  badges: BadgeWithModule[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOverallProgress: () => Promise<void>;
  fetchModuleProgress: (moduleId: string) => Promise<UserProgress | null>;
  startModule: (moduleId: string) => Promise<UserProgress>;
  completeStep: (progressId: string, stepType: StepType) => Promise<void>;
  setCurrentProgress: (progress: UserProgress | null) => void;
  addBadge: (badge: BadgeWithModule) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial State
  currentProgress: null,
  overallProgress: null,
  moduleProgresses: new Map(),
  badges: [],
  isLoading: false,
  error: null,

  // Actions
  fetchOverallProgress: async () => {
    set({ isLoading: true });
    
    try {
      const [overall, badges] = await Promise.all([
        apiClient.get<OverallProgress>('/api/progress').then(res => res.data),
        apiClient.get<BadgeWithModule[]>('/api/progress/badges').then(res => res.data),
      ]);

      set({
        overallProgress: overall,
        badges,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  fetchModuleProgress: async (moduleId) => {
    const cached = get().moduleProgresses.get(moduleId);
    if (cached) return cached;

    try {
      const { data: progress } = await apiClient.get<UserProgress>(`/api/progress/module/${moduleId}`);
      
      if (progress) {
        set((state) => ({
          moduleProgresses: new Map(state.moduleProgresses).set(moduleId, progress),
        }));
      }
      
      return progress;
    } catch (error) {
      console.error('Failed to fetch module progress:', error);
      return null;
    }
  },

  startModule: async (moduleId) => {
    set({ isLoading: true });
    
    try {
      const { data: progress } = await apiClient.post<UserProgress>(`/api/modules/${moduleId}/start`);
      
      set((state) => ({
        currentProgress: progress,
        moduleProgresses: new Map(state.moduleProgresses).set(moduleId, progress),
        isLoading: false,
      }));
      
      return progress;
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  },

  completeStep: async (progressId, stepType) => {
    try {
      const { data: result } = await apiClient.post<{ moduleCompleted: boolean; badgesEarned: BadgeWithModule[] }>(`/api/progress/${progressId}/complete-step`, { stepType });
      
      // 현재 진도 업데이트
      const currentProgress = get().currentProgress;
      if (currentProgress?.id === progressId) {
        const stepOrder: StepType[] = [
          'socratic_dialogue',
          'prompt_writing', 
          'comparison_lab',
          'reflection_journal',
        ];
        const currentIndex = stepOrder.indexOf(stepType);
        const nextStep = stepOrder[currentIndex + 1];

        set({
          currentProgress: {
            ...currentProgress,
            currentStep: nextStep || stepType,
            status: result.moduleCompleted ? 'completed' : 'in_progress',
            completedAt: result.moduleCompleted ? new Date() : null,
          },
        });
      }

      // 배지 획득 시 추가
      if (result.badgesEarned?.length) {
        set((state) => ({
          badges: [...state.badges, ...result.badgesEarned],
        }));
      }

      // 전체 진도 갱신
      get().fetchOverallProgress();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setCurrentProgress: (progress) => set({ currentProgress: progress }),
  
  addBadge: (badge) => set((state) => ({
    badges: [...state.badges, badge],
  })),
}));
```

### 2.3 Dialogue Store

```typescript
// src/features/socratic-dialogue/stores/dialogue.store.ts

import { create } from 'zustand';
import type { Dialogue, DialogueMessage } from '@/domain/entities/dialogue.entity';

interface DialogueState {
  // State
  currentDialogue: Dialogue | null;
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  canProceed: boolean;
  error: string | null;

  // Actions
  setDialogue: (dialogue: Dialogue | null) => void;
  addMessage: (message: DialogueMessage) => void;
  updateStreamingContent: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setCanProceed: (canProceed: boolean) => void;
  completeDialogue: () => void;
  reset: () => void;
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  // Initial State
  currentDialogue: null,
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  canProceed: false,
  error: null,

  // Actions
  setDialogue: (dialogue) => set({ currentDialogue: dialogue }),
  
  addMessage: (message) => set((state) => ({
    currentDialogue: state.currentDialogue
      ? {
          ...state.currentDialogue,
          messages: [...state.currentDialogue.messages, message],
        }
      : null,
    streamingContent: '',
  })),

  updateStreamingContent: (content) => set({ streamingContent: content }),
  
  setStreaming: (isStreaming) => set({ 
    isStreaming,
    streamingContent: isStreaming ? '' : get().streamingContent,
  }),

  setCanProceed: (canProceed) => set({ canProceed }),
  
  completeDialogue: () => set((state) => ({
    currentDialogue: state.currentDialogue
      ? { ...state.currentDialogue, isCompleted: true }
      : null,
    canProceed: true,
  })),

  reset: () => set({
    currentDialogue: null,
    isLoading: false,
    isStreaming: false,
    streamingContent: '',
    canProceed: false,
    error: null,
  }),
}));
```

### 2.4 UI Store (공통)

```typescript
// src/stores/ui.store.ts (공통 UI 상태는 src/stores에 위치)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ko' | 'en';

interface UIState {
  // State
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  isMobile: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial State
      theme: 'system',
      language: 'ko',
      sidebarOpen: true,
      isMobile: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setIsMobile: (isMobile) => set({ isMobile, sidebarOpen: !isMobile }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
```

## 3. React Query 설정

### 3.1 Query Client 설정

```typescript
// src/lib/query-client.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분 (이전 cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 3.2 Query Keys

```typescript
// src/lib/query-keys.ts

export const queryKeys = {
  // Modules
  modules: {
    all: ['modules'] as const,
    list: () => [...queryKeys.modules.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.modules.all, 'detail', id] as const,
  },

  // Progress
  progress: {
    all: ['progress'] as const,
    overall: () => [...queryKeys.progress.all, 'overall'] as const,
    module: (moduleId: string) => [...queryKeys.progress.all, 'module', moduleId] as const,
    badges: () => [...queryKeys.progress.all, 'badges'] as const,
  },

  // Dialogues
  dialogues: {
    all: ['dialogues'] as const,
    byProgress: (progressId: string) => [...queryKeys.dialogues.all, progressId] as const,
  },

  // Reflections
  reflections: {
    all: ['reflections'] as const,
    list: () => [...queryKeys.reflections.all, 'list'] as const,
    byModule: (moduleId: string) => [...queryKeys.reflections.all, 'module', moduleId] as const,
  },

  // Scenarios
  scenarios: {
    all: ['scenarios'] as const,
    byModule: (moduleId: string) => [...queryKeys.scenarios.all, 'module', moduleId] as const,
    detail: (id: string) => [...queryKeys.scenarios.all, 'detail', id] as const,
  },
};
```

### 3.3 Custom Hooks with React Query

```typescript
// src/features/modules/hooks/useModules.ts

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient } from '@/lib/remote/api-client';
import type { ModuleWithProgress } from '@/domain/entities/module.entity';

export function useModules() {
  return useQuery({
    queryKey: queryKeys.modules.list(),
    queryFn: () => apiClient.get<{ modules: ModuleWithProgress[] }>('/api/modules').then(res => res.data.modules),
  });
}

export function useModule(moduleId: string) {
  return useQuery({
    queryKey: queryKeys.modules.detail(moduleId),
    queryFn: () => apiClient.get<{ module: ModuleWithProgress }>(`/api/modules/${moduleId}`).then(res => res.data.module),
    enabled: !!moduleId,
  });
}
```

```typescript
// src/features/progress/hooks/useProgress.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient } from '@/lib/remote/api-client';
import { useProgressStore } from '@/features/progress/stores/progress.store';
import type { StepType, OverallProgress } from '@/domain/entities/progress.entity';

export function useOverallProgress() {
  const setStore = useProgressStore((state) => ({
    setOverall: state.fetchOverallProgress,
  }));

  return useQuery({
    queryKey: queryKeys.progress.overall(),
    queryFn: () => apiClient.get<OverallProgress>('/api/progress').then(res => res.data),
  });
}

export function useCompleteStep() {
  const queryClient = useQueryClient();
  const completeStep = useProgressStore((state) => state.completeStep);

  return useMutation({
    mutationFn: ({ progressId, stepType }: { progressId: string; stepType: StepType }) =>
      completeStep(progressId, stepType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
    },
  });
}
```

## 4. 상태 초기화 및 동기화

### 4.1 Auth Provider

```typescript
// src/components/providers/auth-provider.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser-client';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser, refreshSession } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        refreshSession();
      } else {
        setUser(null);
      }
    });

    // Auth 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await refreshSession();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await refreshSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, refreshSession, router]);

  return <>{children}</>;
}
```

### 4.2 Query Provider

```typescript
// src/components/providers/query-provider.tsx

'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

## 5. 낙관적 업데이트 예시

```typescript
// src/features/reflection/hooks/useReflectionMutation.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient } from '@/lib/remote/api-client';
import type { ReflectionInput } from '@/types/reflection.types';
import type { Reflection } from '@/domain/entities/reflection.entity';

export function useCreateReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReflectionInput) => apiClient.post<Reflection>('/api/reflections', data).then(res => res.data),
    
    // 낙관적 업데이트
    onMutate: async (newReflection) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: queryKeys.reflections.list() });

      // 이전 데이터 스냅샷
      const previousReflections = queryClient.getQueryData(queryKeys.reflections.list());

      // 낙관적으로 새 데이터 추가
      queryClient.setQueryData(queryKeys.reflections.list(), (old: any) => [
        { ...newReflection, id: 'temp-id', createdAt: new Date() },
        ...old,
      ]);

      return { previousReflections };
    },

    // 에러 시 롤백
    onError: (err, newReflection, context) => {
      queryClient.setQueryData(
        queryKeys.reflections.list(),
        context?.previousReflections
      );
    },

    // 완료 후 캐시 갱신
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reflections.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
    },
  });
}
```
