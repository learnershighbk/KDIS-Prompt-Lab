import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import type { AppEnv, AppContext } from '@/backend/hono/context';
import { success, failure, respond } from '@/backend/http/response';
import { AIService } from './service';
import {
  socraticRequestSchema,
  promptAnalysisRequestSchema,
  comparisonRequestSchema,
} from './schema';

const aiRoutes = new Hono<AppEnv>();

const getAIService = (c: AppContext) => {
  const supabase = c.get('supabase');
  const config = c.get('config');
  return new AIService(supabase, config.anthropic.apiKey);
};

aiRoutes.post('/api/ai/socratic', async (c) => {
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = socraticRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = getAIService(c);
    const { message, canProceed } = await service.generateSocraticResponse(data);

    logger.info('Socratic response generated', { moduleId: data.moduleId, canProceed });

    return respond(c, success({
      message,
      canProceed,
    }));
  } catch (error) {
    logger.error('Socratic response failed', { error });
    return respond(c, failure(500, 'AI_ERROR', error instanceof Error ? error.message : 'AI 응답 생성에 실패했습니다'));
  }
});

aiRoutes.post('/api/ai/socratic/stream', async (c) => {
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = socraticRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = getAIService(c);

    logger.info('Socratic stream started', { moduleId: data.moduleId });

    return streamText(c, async (stream) => {
      for await (const chunk of service.streamSocraticResponse(data)) {
        await stream.write(chunk);
      }
    });
  } catch (error) {
    logger.error('Socratic stream failed', { error });
    return respond(c, failure(500, 'AI_STREAM_ERROR', error instanceof Error ? error.message : 'AI 스트리밍에 실패했습니다'));
  }
});

aiRoutes.get('/api/ai/socratic/initial/:moduleId', async (c) => {
  const moduleId = c.req.param('moduleId');
  const service = getAIService(c);
  const message = service.getInitialMessage(moduleId);

  return respond(c, success({ message }));
});

aiRoutes.post('/api/ai/analyze-prompt', async (c) => {
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = promptAnalysisRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = getAIService(c);
    const result = await service.analyzePrompt(data);

    logger.info('Prompt analyzed', { moduleId: data.moduleId });

    return respond(c, success(result));
  } catch (error) {
    logger.error('Prompt analysis failed', { error });
    return respond(c, failure(500, 'ANALYSIS_ERROR', error instanceof Error ? error.message : '프롬프트 분석에 실패했습니다'));
  }
});

aiRoutes.post('/api/ai/compare', async (c) => {
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = comparisonRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return respond(c, failure(400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'));
    }

    const data = parseResult.data;
    const service = getAIService(c);
    const result = await service.comparePrompts(data);

    logger.info('Prompts compared', { moduleId: data.moduleId });

    return respond(c, success(result));
  } catch (error) {
    logger.error('Prompt comparison failed', { error });
    return respond(c, failure(500, 'COMPARISON_ERROR', error instanceof Error ? error.message : '프롬프트 비교에 실패했습니다'));
  }
});

export function registerAIRoutes(app: Hono<AppEnv>) {
  app.route('/', aiRoutes);
}
