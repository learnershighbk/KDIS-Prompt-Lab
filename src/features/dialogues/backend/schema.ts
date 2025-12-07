import { z } from 'zod';

export const messageRoleSchema = z.enum(['tutor', 'student']);

export const questionTypeSchema = z.enum([
  'exploration',
  'clarification',
  'assumption',
  'consequence',
  'reflection',
]);

export const messageSchema = z.object({
  role: messageRoleSchema,
  content: z.string(),
  questionType: questionTypeSchema.optional(),
  timestamp: z.string(),
});

export const dialogueSchema = z.object({
  id: z.string().uuid(),
  progressId: z.string().uuid(),
  messages: z.array(messageSchema),
  isCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createDialogueRequestSchema = z.object({
  progressId: z.string().uuid(),
});

export const createDialogueResponseSchema = z.object({
  dialogueId: z.string().uuid(),
  initialMessage: z.object({
    role: z.literal('tutor'),
    content: z.string(),
    questionType: questionTypeSchema,
  }),
});

export const sendMessageRequestSchema = z.object({
  content: z.string().min(1, '메시지를 입력해주세요'),
});

export const sendMessageResponseSchema = z.object({
  userMessage: z.object({
    role: z.literal('student'),
    content: z.string(),
    timestamp: z.string(),
  }),
  tutorResponse: z.object({
    role: z.literal('tutor'),
    content: z.string(),
    questionType: questionTypeSchema,
    timestamp: z.string(),
  }),
  isCompleted: z.boolean(),
  canProceed: z.boolean(),
});

export const getDialogueResponseSchema = z.object({
  dialogueId: z.string().uuid(),
  messages: z.array(messageSchema),
  isCompleted: z.boolean(),
});

export type MessageRole = z.infer<typeof messageRoleSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Dialogue = z.infer<typeof dialogueSchema>;
export type CreateDialogueRequest = z.infer<typeof createDialogueRequestSchema>;
export type CreateDialogueResponse = z.infer<typeof createDialogueResponseSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
export type GetDialogueResponse = z.infer<typeof getDialogueResponseSchema>;
