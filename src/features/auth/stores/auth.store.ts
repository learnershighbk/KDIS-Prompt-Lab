'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  preferredLanguage: 'ko' | 'en';
  studentId: string | null;
  department: string | null;
  roles: UserRole[];
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  simpleLogin: (studentId: string, pin: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  clearError: () => void;
}

interface ProfileData {
  full_name?: string | null;
  avatar_url?: string | null;
  preferred_language?: 'ko' | 'en' | null;
  student_id?: string | null;
  department?: string | null;
  user_roles?: { role: UserRole }[] | null;
}

function buildUserProfile(
  userId: string,
  email: string,
  profileData: ProfileData | null,
  fallbackStudentId?: string
): UserProfile {
  return {
    id: userId,
    email: email,
    fullName: profileData?.full_name ?? null,
    avatarUrl: profileData?.avatar_url ?? null,
    preferredLanguage: profileData?.preferred_language ?? 'ko',
    studentId: profileData?.student_id ?? fallbackStudentId ?? null,
    department: profileData?.department ?? null,
    roles: profileData?.user_roles?.map((r) => r.role) ?? ['student'],
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        const supabase = getSupabaseBrowserClient();
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (!data.user) {
            set({ isLoading: false, error: '로그인에 실패했습니다' });
            return { success: false, error: '로그인에 실패했습니다' };
          }

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*, user_roles(role)')
            .eq('id', data.user.id)
            .single();

          const userProfile = buildUserProfile(
            data.user.id,
            data.user.email ?? '',
            profileData as ProfileData | null
          );

          set({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      simpleLogin: async (studentId: string, pin: string) => {
        const supabase = getSupabaseBrowserClient();
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/simple-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, pin }),
          });

          const result = await response.json();

          if (!response.ok || !result.ok) {
            const errorMessage = result.error?.message ?? '로그인에 실패했습니다';
            set({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
          }

          const SIMPLE_AUTH_EMAIL_DOMAIN = 'promptlab.app';
          const PIN_PREFIX = 'PIN:';
          const email = `${studentId}@${SIMPLE_AUTH_EMAIL_DOMAIN}`;
          const password = `${PIN_PREFIX}${pin}`;

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError || !signInData.user) {
            set({ isLoading: false, error: '로그인 세션 생성에 실패했습니다' });
            return { success: false, error: '로그인 세션 생성에 실패했습니다' };
          }

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*, user_roles(role)')
            .eq('id', signInData.user.id)
            .single();

          const userProfile = buildUserProfile(
            signInData.user.id,
            signInData.user.email ?? '',
            profileData as ProfileData | null,
            studentId
          );

          set({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, isNewUser: result.data?.isNewUser ?? false };
        } catch (err) {
          const message = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      signup: async (email: string, password: string, fullName: string) => {
        const supabase = getSupabaseBrowserClient();
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
            },
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, error: null });
      },

      refreshSession: async () => {
        const supabase = getSupabaseBrowserClient();
        set({ isLoading: true });

        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*, user_roles(role)')
              .eq('id', user.id)
              .single();

            const userProfile = buildUserProfile(
              user.id,
              user.email ?? '',
              profileData as ProfileData | null
            );

            set({
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.roles.includes(role) ?? false;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'prompt-lab-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
