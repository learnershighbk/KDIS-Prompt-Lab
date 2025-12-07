# Auth Agent Instructions

> Supabase Auth 기반 인증 시스템 구현 담당 에이전트

## 🎯 역할 및 책임

1. **Supabase Auth 통합**: 이메일/비밀번호 인증
2. **세션 관리**: JWT 토큰 및 쿠키 관리
3. **역할 기반 접근 제어**: Student/Instructor/Admin
4. **보호된 라우트**: AuthGuard 컴포넌트

## 📚 필수 참조 문서

- `docs/API-SPEC.md` - 인증 API 엔드포인트
- `docs/STATE-MANAGEMENT.md` - authStore 구현
- `docs/TYPE-DEFINITIONS.md` - User, Session 타입

---

## 📋 작업 체크리스트

### Step 1: Supabase 클라이언트 설정

```typescript
// src/infrastructure/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// src/infrastructure/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

```typescript
// src/infrastructure/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}
```

### Step 2: Auth Store (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/infrastructure/supabase/client';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  roles: UserRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      isLoading: true,
      isAuthenticated: false,

      login: async (email, password) => {
        const supabase = createClient();
        set({ isLoading: true });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // 프로필 및 역할 조회
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, user_roles(role)')
          .eq('id', data.user.id)
          .single();
        
        set({
          user: profile,
          roles: profile?.user_roles?.map((r: any) => r.role) || ['student'],
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: async (email, password, fullName) => {
        const supabase = createClient();
        set({ isLoading: true });
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        
        if (error) throw error;
        set({ isLoading: false });
      },

      logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, roles: [], isAuthenticated: false });
      },

      refreshSession: async () => {
        const supabase = createClient();
        set({ isLoading: true });
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, user_roles(role)')
            .eq('id', user.id)
            .single();
          
          set({
            user: profile,
            roles: profile?.user_roles?.map((r: any) => r.role) || ['student'],
            isAuthenticated: true,
          });
        }
        
        set({ isLoading: false });
      },

      hasRole: (role) => get().roles.includes(role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, roles: state.roles }),
    }
  )
);
```

### Step 3: Auth Provider

```typescript
// src/components/features/auth/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshSession, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();
    
    // 초기 세션 확인
    refreshSession();
    
    // Auth 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          await refreshSession();
        } else if (event === 'SIGNED_OUT') {
          router.push(ROUTES.LOGIN);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push(ROUTES.LOGIN);
      } else if (isAuthenticated && isPublicRoute) {
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
```

### Step 4: AuthGuard 컴포넌트

```typescript
// src/components/features/auth/AuthGuard.tsx
'use client';

import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  allowedRoles,
  fallback = <div>Access Denied</div>
}: AuthGuardProps) {
  const { isAuthenticated, roles } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && !allowedRoles.some(role => roles.includes(role))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### Step 5: 로그인/회원가입 폼

```typescript
// src/components/features/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      await login(data.email, data.password);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="이메일"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Input
          type="password"
          placeholder="비밀번호"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
```

### Step 6: Middleware

```typescript
// src/middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/infrastructure/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## ✅ 완료 조건

- [ ] 로그인/로그아웃 플로우 동작
- [ ] 회원가입 후 자동 프로필 생성
- [ ] 세션 유지 (새로고침 후에도)
- [ ] 역할 기반 라우트 보호
- [ ] 인증되지 않은 사용자 리다이렉트

---

## ➡️ 다음 단계

Auth 완료 후 → **API Agent** 및 **UI Agent** 병렬 실행 가능
