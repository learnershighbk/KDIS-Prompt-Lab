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

  private async createUserProfile(userId: string, studentId: string): Promise<void> {
    const { error: profileError } = await this.supabase
      .from('profiles')
      .upsert({
        id: userId,
        student_id: studentId,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
    }

    const { error: roleError } = await this.supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'student',
      }, { onConflict: 'user_id,role' });

    if (roleError) {
      console.error('Failed to create user role:', roleError);
    }
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
      const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            student_id: data.studentId,
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        console.error('Supabase signUp error:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
          cause: signUpError.cause,
        });
        throw new Error(`사용자 생성 실패: ${signUpError.message}`);
      }

      if (!signUpData.user) {
        throw new Error('회원가입에 실패했습니다');
      }

      await this.createUserProfile(signUpData.user.id, data.studentId);

      if (signUpData.session) {
        return {
          user: {
            id: signUpData.user.id,
            email: signUpData.user.email!,
            studentId: data.studentId,
          },
          isNewUser: true,
        };
      }

      const { data: autoSignInData, error: autoSignInError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (autoSignInError || !autoSignInData.user) {
        throw new Error('자동 로그인에 실패했습니다. 이메일 확인이 필요할 수 있습니다.');
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
