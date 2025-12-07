import type { SupabaseClient } from '@supabase/supabase-js';
import type { SignupRequest, LoginRequest, SimpleLoginRequest } from './schema';

const SIMPLE_AUTH_EMAIL_DOMAIN = 'promptlab.app';
const PIN_PREFIX = 'PIN:';

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  private toEmail(studentId: string): string {
    return `${studentId}@${SIMPLE_AUTH_EMAIL_DOMAIN}`;
  }

  private toPassword(pin: string): string {
    return `${PIN_PREFIX}${pin}`;
  }

  async signup(data: SignupRequest) {
    const { data: authData, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('회원가입에 실패했습니다');
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: data.fullName,
      },
    };
  }

  async login(data: LoginRequest) {
    const { data: authData, error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('로그인에 실패했습니다');
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: authData.user.user_metadata?.full_name ?? null,
      },
    };
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    const { data: roles } = await this.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        fullName: session.user.user_metadata?.full_name ?? null,
        avatarUrl: session.user.user_metadata?.avatar_url ?? null,
        roles: roles?.map((r) => r.role) ?? ['student'],
      },
      isAuthenticated: true,
    };
  }

  async refreshSession() {
    const { data: { session }, error } = await this.supabase.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        fullName: session.user.user_metadata?.full_name ?? null,
        avatarUrl: session.user.user_metadata?.avatar_url ?? null,
        roles: ['student'],
      },
      isAuthenticated: true,
    };
  }

  async simpleLogin(data: SimpleLoginRequest) {
    const email = this.toEmail(data.studentId);
    const password = this.toPassword(data.pin);

    const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.user) {
      return {
        user: {
          id: signInData.user.id,
          email: signInData.user.email!,
          studentId: data.studentId,
        },
        isNewUser: false,
      };
    }

    if (signInError?.message?.includes('Invalid login credentials')) {
      const { data: createData, error: createError } = await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          student_id: data.studentId,
        },
      });

      if (createError) {
        throw new Error(createError.message);
      }

      if (!createData.user) {
        throw new Error('회원가입에 실패했습니다');
      }

      const { data: autoSignInData, error: autoSignInError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (autoSignInError || !autoSignInData.user) {
        throw new Error('자동 로그인에 실패했습니다');
      }

      return {
        user: {
          id: autoSignInData.user.id,
          email: autoSignInData.user.email!,
          studentId: data.studentId,
        },
        isNewUser: true,
      };
    }

    throw new Error(signInError?.message ?? '로그인에 실패했습니다');
  }
}
