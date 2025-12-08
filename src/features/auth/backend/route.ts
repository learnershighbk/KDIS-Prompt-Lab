import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { success, failure, respond } from '@/backend/http/response';
import { AuthService } from './service';
import { signupRequestSchema, loginRequestSchema, simpleLoginRequestSchema } from './schema';

const authRoutes = new Hono<AppEnv>();

authRoutes.post('/api/auth/signup', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = signupRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = new AuthService(supabase);
    const result = await service.signup(data);

    logger.info('User signed up successfully', { email: data.email });

    return respond(c, success({
      ...result,
      redirectTo: '/dashboard',
    }, 201));
  } catch (error) {
    logger.error('Signup failed', { error });
    return respond(c, failure(400, 'SIGNUP_FAILED', error instanceof Error ? error.message : '회원가입에 실패했습니다'));
  }
});

authRoutes.post('/api/auth/login', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = loginRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = new AuthService(supabase);
    const result = await service.login(data);

    logger.info('User logged in successfully', { email: data.email });

    return respond(c, success({
      ...result,
      redirectTo: '/dashboard',
    }));
  } catch (error) {
    logger.error('Login failed', { error });
    return respond(c, failure(401, 'LOGIN_FAILED', error instanceof Error ? error.message : '로그인에 실패했습니다'));
  }
});

authRoutes.post('/api/auth/simple-login', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = simpleLoginRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = new AuthService(supabase);
    const result = await service.simpleLogin(data);

    logger.info('Simple login successful', { studentId: data.studentId, isNewUser: result.isNewUser });

    return respond(c, success({
      ...result,
      redirectTo: '/dashboard',
    }, result.isNewUser ? 201 : 200));
  } catch (error) {
    logger.error('Simple login failed', { error });
    return respond(c, failure(401, 'LOGIN_FAILED', error instanceof Error ? error.message : '로그인에 실패했습니다'));
  }
});

authRoutes.post('/api/auth/logout', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const service = new AuthService(supabase);
    await service.logout();

    logger.info('User logged out successfully');

    return respond(c, success({
      redirectTo: '/login',
    }));
  } catch (error) {
    logger.error('Logout failed', { error });
    return respond(c, failure(500, 'LOGOUT_FAILED', error instanceof Error ? error.message : '로그아웃에 실패했습니다'));
  }
});

authRoutes.get('/api/auth/session', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const service = new AuthService(supabase);
    const result = await service.getSession();

    return respond(c, success(result));
  } catch (error) {
    logger.error('Get session failed', { error });
    return respond(c, failure(500, 'SESSION_ERROR', error instanceof Error ? error.message : '세션 조회에 실패했습니다'));
  }
});

authRoutes.post('/api/auth/refresh', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const service = new AuthService(supabase);
    const result = await service.refreshSession();

    logger.info('Session refreshed successfully');

    return respond(c, success(result));
  } catch (error) {
    logger.error('Refresh session failed', { error });
    return respond(c, failure(500, 'REFRESH_FAILED', error instanceof Error ? error.message : '세션 갱신에 실패했습니다'));
  }
});

export function registerAuthRoutes(app: Hono<AppEnv>) {
  app.route('/', authRoutes);
}
