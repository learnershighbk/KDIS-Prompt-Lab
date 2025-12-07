import { z } from 'zod';

export const stepTypeSchema = z.enum([
  'socratic_dialogue',
  'prompt_writing',
  'comparison_lab',
  'reflection_journal',
]);

export const progressStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
]);

export const userProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  moduleId: z.string().uuid(),
  currentStep: stepTypeSchema.nullable(),
  status: progressStatusSchema,
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  score: z.number().nullable(),
});

export const progressOverviewResponseSchema = z.object({
  overall: z.object({
    completedModules: z.number(),
    totalModules: z.number(),
    percentage: z.number(),
  }),
  modules: z.array(z.object({
    moduleId: z.string().uuid(),
    moduleTitle: z.string(),
    status: progressStatusSchema,
    currentStep: stepTypeSchema.nullable(),
    stepsCompleted: z.number(),
    totalSteps: z.number(),
    completedAt: z.string().nullable(),
  })),
  badges: z.array(z.object({
    technique: z.string(),
    moduleTitle: z.string(),
    earnedAt: z.string(),
  })),
  recentActivity: z.array(z.object({
    type: z.enum(['module_started', 'step_completed', 'module_completed']),
    moduleTitle: z.string(),
    timestamp: z.string(),
  })),
});

export const completeStepRequestSchema = z.object({
  stepType: stepTypeSchema,
});

export const completeStepResponseSchema = z.object({
  nextStep: stepTypeSchema.nullable(),
  moduleCompleted: z.boolean(),
  unlockedModule: z.string().nullable(),
});

export type StepType = z.infer<typeof stepTypeSchema>;
export type ProgressStatus = z.infer<typeof progressStatusSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type ProgressOverviewResponse = z.infer<typeof progressOverviewResponseSchema>;
export type CompleteStepRequest = z.infer<typeof completeStepRequestSchema>;
export type CompleteStepResponse = z.infer<typeof completeStepResponseSchema>;
