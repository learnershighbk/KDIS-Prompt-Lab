import { z } from 'zod';

export const signupRequestSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  fullName: z.string().min(2, '이름은 2자 이상이어야 합니다'),
});

export const loginRequestSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// 간편 로그인 스키마 (학번 + PIN)
export const simpleLoginRequestSchema = z.object({
  studentId: z
    .string()
    .regex(/^\d{9}$/, '학번(사번)은 9자리 숫자여야 합니다'),
  pin: z
    .string()
    .regex(/^\d{4}$/, 'PIN은 4자리 숫자여야 합니다'),
});

export type SimpleLoginRequest = z.infer<typeof simpleLoginRequestSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string().nullable(),
  }),
  redirectTo: z.string().optional(),
});

export const sessionResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    roles: z.array(z.string()),
  }).nullable(),
  isAuthenticated: z.boolean(),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
