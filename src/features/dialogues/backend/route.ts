import type { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { success, failure, respond } from '@/backend/http/response';
import { createDialogue, sendMessage, getDialogue } from './service';
import { createDialogueRequestSchema, sendMessageRequestSchema } from './schema';

export const registerDialoguesRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/dialogues', async (c) => {
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

      const body = await c.req.json();
      const parseResult = createDialogueRequestSchema.safeParse(body);

      if (!parseResult.success) {
        return respond(c, failure(400, 'VALIDATION_ERROR', '유효하지 않은 요청입니다.', {
          details: parseResult.error.flatten().fieldErrors,
        }));
      }

      const result = await createDialogue(supabase, parseResult.data.progressId, user.id);
      return respond(c, success(result, 201));
    } catch (err) {
      logger.error('Failed to create dialogue', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      const status: ContentfulStatusCode = message === 'Progress not found' ? 404 : message === 'Unauthorized' ? 403 : 500;
      const code = status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR';
      return respond(c, failure(status, code, message));
    }
  });

  app.post('/api/dialogues/:dialogueId/messages', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const dialogueId = c.req.param('dialogueId');

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
      const parseResult = sendMessageRequestSchema.safeParse(body);

      if (!parseResult.success) {
        return respond(c, failure(400, 'VALIDATION_ERROR', '유효하지 않은 요청입니다.', {
          details: parseResult.error.flatten().fieldErrors,
        }));
      }

      const result = await sendMessage(supabase, dialogueId, parseResult.data.content, user.id);
      return respond(c, success(result));
    } catch (err) {
      logger.error('Failed to send message', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      let status: ContentfulStatusCode = 500;
      if (message === 'Dialogue not found') status = 404;
      if (message === 'Unauthorized') status = 403;
      if (message === 'Dialogue already completed') status = 400;

      const code = status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
      return respond(c, failure(status, code, message));
    }
  });

  app.get('/api/dialogues/:dialogueId', async (c) => {
    const logger = getLogger(c);
    const supabase = getSupabase(c);
    const dialogueId = c.req.param('dialogueId');

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

      const result = await getDialogue(supabase, dialogueId, user.id);
      return respond(c, success(result));
    } catch (err) {
      logger.error('Failed to get dialogue', err);
      const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
      const status: ContentfulStatusCode = message === 'Dialogue not found' ? 404 : message === 'Unauthorized' ? 403 : 500;
      const code = status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR';
      return respond(c, failure(status, code, message));
    }
  });
};
