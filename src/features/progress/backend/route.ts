import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { success, failure } from '@/backend/http/response';
import { getProgressOverview, completeStep } from './service';
import { completeStepRequestSchema } from './schema';

export const registerProgressRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/progress', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);

    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return c.json(failure('UNAUTHORIZED', '인증이 필요합니다.'), 401);
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return c.json(failure('UNAUTHORIZED', '유효하지 않은 토큰입니다.'), 401);
      }

      const result = await getProgressOverview(supabase, user.id);
      return c.json(success(result));
    } catch (err) {
      logger.error('Failed to get progress', err);
      return c.json(
        failure('INTERNAL_ERROR', err instanceof Error ? err.message : '서버 오류가 발생했습니다.'),
        500
      );
    }
  });

  app.post('/api/progress/:progressId/complete-step', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const progressId = c.req.param('progressId');

    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return c.json(failure('UNAUTHORIZED', '인증이 필요합니다.'), 401);
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return c.json(failure('UNAUTHORIZED', '유효하지 않은 토큰입니다.'), 401);
      }

      const body = await c.req.json();
      const parseResult = completeStepRequestSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json(
          failure('VALIDATION_ERROR', '유효하지 않은 요청입니다.', {
            details: parseResult.error.flatten().fieldErrors,
          }),
          400
        );
      }

      const result = await completeStep(supabase, progressId, parseResult.data.stepType, user.id);
      return c.json(success(result));
    } catch (err) {
      logger.error('Failed to complete step', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      const status = message === 'Progress not found' ? 404 : 500;
      return c.json(
        failure(status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', message),
        status
      );
    }
  });
};
