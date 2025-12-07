import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import type { AppEnv } from '@/backend/hono/context';
import { success, failure } from '@/backend/http/response';
import { AIService } from './service';
import {
  socraticRequestSchema,
  promptAnalysisRequestSchema,
  comparisonRequestSchema,
} from './schema';

const aiRoutes = new Hono<AppEnv>();

aiRoutes.post('/api/ai/socratic', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = socraticRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        failure('VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'),
        400
      );
    }

    const data = parseResult.data;
    const service = new AIService(supabase);
    const response = await service.generateSocraticResponse(data);

    logger.info('Socratic response generated', { moduleId: data.moduleId });

    return c.json(
      success({
        message: response,
      })
    );
  } catch (error) {
    logger.error('Socratic response failed', { error });
    return c.json(
      failure('AI_ERROR', error instanceof Error ? error.message : 'AI 응답 생성에 실패했습니다'),
      500
    );
  }
});

aiRoutes.post('/api/ai/socratic/stream', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = socraticRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        failure('VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'),
        400
      );
    }

    const data = parseResult.data;
    const service = new AIService(supabase);
    const response = await service.generateSocraticResponse(data);

    logger.info('Socratic stream started', { moduleId: data.moduleId });

    return streamText(c, async (stream) => {
      for await (const chunk of service.streamResponse(response)) {
        await stream.write(chunk);
      }
    });
  } catch (error) {
    logger.error('Socratic stream failed', { error });
    return c.json(
      failure('AI_STREAM_ERROR', error instanceof Error ? error.message : 'AI 스트리밍에 실패했습니다'),
      500
    );
  }
});

aiRoutes.post('/api/ai/analyze-prompt', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = promptAnalysisRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        failure('VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'),
        400
      );
    }

    const data = parseResult.data;
    const service = new AIService(supabase);
    const result = await service.analyzePrompt(data);

    logger.info('Prompt analyzed', { moduleId: data.moduleId });

    return c.json(success(result));
  } catch (error) {
    logger.error('Prompt analysis failed', { error });
    return c.json(
      failure('ANALYSIS_ERROR', error instanceof Error ? error.message : '프롬프트 분석에 실패했습니다'),
      500
    );
  }
});

aiRoutes.post('/api/ai/compare', async (c) => {
  const supabase = c.get('supabase');
  const logger = c.get('logger');

  try {
    const body = await c.req.json();
    const parseResult = comparisonRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        failure('VALIDATION_ERROR', parseResult.error.errors[0]?.message || '입력값이 올바르지 않습니다'),
        400
      );
    }

    const data = parseResult.data;
    const service = new AIService(supabase);
    const result = await service.comparePrompts(data);

    logger.info('Prompts compared', { moduleId: data.moduleId });

    return c.json(success(result));
  } catch (error) {
    logger.error('Prompt comparison failed', { error });
    return c.json(
      failure('COMPARISON_ERROR', error instanceof Error ? error.message : '프롬프트 비교에 실패했습니다'),
      500
    );
  }
});

export function registerAIRoutes(app: Hono<AppEnv>) {
  app.route('/', aiRoutes);
}
