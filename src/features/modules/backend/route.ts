import type { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { success, failure, respond } from '@/backend/http/response';
import { getModulesWithProgress, getModuleDetail, startModule } from './service';

export const registerModulesRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/modules', async (c) => {
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

      const result = await getModulesWithProgress(supabase, user.id);
      return respond(c, success(result));
    } catch (err) {
      logger.error('Failed to get modules', err);
      return respond(c, failure(500, 'INTERNAL_ERROR', err instanceof Error ? err.message : '서버 오류가 발생했습니다.'));
    }
  });

  app.get('/api/modules/:moduleId', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const moduleId = c.req.param('moduleId');

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

      const result = await getModuleDetail(supabase, moduleId, user.id);
      return respond(c, success(result));
    } catch (err) {
      logger.error('Failed to get module detail', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      const status: ContentfulStatusCode = message === 'Module not found' ? 404 : 500;
      const code = status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR';
      return respond(c, failure(status, code, message));
    }
  });

  app.post('/api/modules/:moduleId/start', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const moduleId = c.req.param('moduleId');

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

      const result = await startModule(supabase, moduleId, user.id);
      return respond(c, success({
        progressId: result.progressId,
        firstStep: {
          type: 'socratic_dialogue' as const,
          initialMessage: result.initialMessage,
        },
      }, 201));
    } catch (err) {
      logger.error('Failed to start module', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      return respond(c, failure(500, 'INTERNAL_ERROR', message));
    }
  });
};
