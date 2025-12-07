import { z } from 'zod';

export const moduleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  titleEn: z.string().nullable(),
  description: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  techniques: z.array(z.string()),
  policyContext: z.string(),
  orderIndex: z.number(),
  isActive: z.boolean(),
  prerequisiteModuleId: z.string().uuid().nullable(),
});

export const moduleWithProgressSchema = moduleSchema.extend({
  isLocked: z.boolean(),
  progress: z.object({
    status: z.enum(['not_started', 'in_progress', 'completed']),
    currentStep: z.enum(['socratic_dialogue', 'prompt_writing', 'comparison_lab', 'reflection_journal']).nullable(),
    percentage: z.number(),
  }).nullable(),
});

export const modulesListResponseSchema = z.object({
  modules: z.array(moduleWithProgressSchema),
  overallProgress: z.object({
    completed: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
});

export const moduleDetailResponseSchema = z.object({
  module: moduleSchema.extend({
    steps: z.array(z.object({
      type: z.enum(['socratic_dialogue', 'prompt_writing', 'comparison_lab', 'reflection_journal']),
      title: z.string(),
      isCompleted: z.boolean(),
      isCurrent: z.boolean(),
    })),
    scenarios: z.array(z.object({
      id: z.string().uuid(),
      title: z.string(),
      titleEn: z.string().nullable(),
      category: z.string(),
      context: z.string(),
      contextEn: z.string().nullable(),
    })),
  }),
  progress: z.object({
    status: z.enum(['not_started', 'in_progress', 'completed']),
    currentStep: z.enum(['socratic_dialogue', 'prompt_writing', 'comparison_lab', 'reflection_journal']).nullable(),
    startedAt: z.string().nullable(),
  }).nullable(),
});

export const startModuleRequestSchema = z.object({
  moduleId: z.string().uuid(),
});

export const startModuleResponseSchema = z.object({
  progressId: z.string().uuid(),
  firstStep: z.object({
    type: z.literal('socratic_dialogue'),
    initialMessage: z.string(),
  }),
});

export type Module = z.infer<typeof moduleSchema>;
export type ModuleWithProgress = z.infer<typeof moduleWithProgressSchema>;
export type ModulesListResponse = z.infer<typeof modulesListResponseSchema>;
export type ModuleDetailResponse = z.infer<typeof moduleDetailResponseSchema>;
export type StartModuleRequest = z.infer<typeof startModuleRequestSchema>;
export type StartModuleResponse = z.infer<typeof startModuleResponseSchema>;
