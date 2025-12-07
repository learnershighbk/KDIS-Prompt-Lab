import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const _clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

if (!_clientEnv.success) {
  const errors = _clientEnv.error.flatten().fieldErrors;
  const missingVars = Object.keys(errors).filter(
    (key) => !process.env[key as keyof typeof process.env]
  );

  console.error('❌ 환경 변수 검증 실패');
  console.error('누락된 환경 변수:', missingVars);
  console.error('상세 에러:', errors);
  console.error('\n💡 해결 방법:');
  console.error('프로젝트 루트에 .env.local 파일을 생성하고 다음 변수를 추가하세요:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n');

  throw new Error(
    `환경 변수가 설정되지 않았습니다. 누락된 변수: ${missingVars.join(', ')}`
  );
}

export const env: ClientEnv = _clientEnv.data;
