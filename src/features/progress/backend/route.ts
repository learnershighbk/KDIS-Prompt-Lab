import type { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { success, failure, respond } from '@/backend/http/response';
import { getProgressOverview, completeStep } from './service';
import { completeStepRequestSchema } from './schema';

export const registerProgressRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/progress', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);

    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return respond(c, failure(401, 'UNAUTHORIZED', '인증이 필요합니다.'));
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return respond(c, failure(401, 'UNAUTHORIZED', '유효하지 않은 토큰입니다.'));
      }

      const result = await getProgressOverview(supabase, user.id);
      return respond(c, success(result));
    } catch (err) {
      logger.error('Failed to get progress', err);
      return respond(c, failure(500, 'INTERNAL_ERROR', err instanceof Error ? err.message : '서버 오류가 발생했습니다.'));
    }
  });

  app.post('/api/progress/:progressId/complete-step', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const progressId = c.req.param('progressId');

    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return respond(c, failure(401, 'UNAUTHORIZED', '인증이 필요합니다.'));
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return respond(c, failure(401, 'UNAUTHORIZED', '유효하지 않은 토큰입니다.'));
      }

      const body = await c.req.json();
      const parseResult = completeStepRequestSchema.safeParse(body);

      if (!parseResult.success) {
        return respond(c, failure(400, 'VALIDATION_ERROR', '유효하지 않은 요청입니다.', {
          details: parseResult.error.flatten().fieldErrors,
        }));
      }

      const result = await completeStep(supabase, progressId, parseResult.data.stepType, user.id);
      return respond(c, success(result));
    } catch (err) {
      logger.error('Failed to complete step', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      const status: ContentfulStatusCode = message === 'Progress not found' ? 404 : 500;
      const code = status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR';
      return respond(c, failure(status, code, message));
    }
  });
};
