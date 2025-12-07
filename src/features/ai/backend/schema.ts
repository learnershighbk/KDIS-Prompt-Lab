import { z } from 'zod';

export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  moduleId: z.string().uuid().optional(),
  stepType: z.enum(['socratic_dialogue', 'prompt_writing', 'comparison_lab']).optional(),
  stream: z.boolean().default(true),
});

export const socraticRequestSchema = z.object({
  moduleId: z.string().uuid(),
  userMessage: z.string().min(1, '메시지를 입력해주세요'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).default([]),
});

export const promptAnalysisRequestSchema = z.object({
  moduleId: z.string().uuid(),
  prompt: z.string().min(1, '프롬프트를 입력해주세요'),
  scenarioContext: z.string().optional(),
});

export const comparisonRequestSchema = z.object({
  moduleId: z.string().uuid(),
  promptA: z.string().min(1, '프롬프트 A를 입력해주세요'),
  promptB: z.string().min(1, '프롬프트 B를 입력해주세요'),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type SocraticRequest = z.infer<typeof socraticRequestSchema>;
export type PromptAnalysisRequest = z.infer<typeof promptAnalysisRequestSchema>;
export type ComparisonRequest = z.infer<typeof comparisonRequestSchema>;
