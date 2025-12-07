# API Agent Instructions

> RESTful API 라우트 및 AI 스트리밍 엔드포인트 구현 담당 에이전트

## 🎯 역할 및 책임

1. **RESTful API**: Next.js Route Handlers 구현
2. **AI 스트리밍**: SSE 기반 실시간 응답
3. **에러 처리**: 일관된 API 응답 형식
4. **인증 미들웨어**: API 레벨 인증 검증

## 📚 필수 참조 문서

- `docs/API-SPEC.md` - 전체 API 명세
- `docs/TYPE-DEFINITIONS.md` - 요청/응답 타입
- `docs/ARCHITECTURE.md` - 레이어드 아키텍처

---

## 📋 작업 체크리스트

### Step 1: API 유틸리티

```typescript
// src/lib/utils/api-response.ts
import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']) {
  return NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
    meta,
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400
) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: { code, message } },
    { status }
  );
}
```

```typescript
// src/lib/utils/api-auth.ts
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { errorResponse } from './api-response';

export async function withAuth(
  handler: (userId: string, supabase: any) => Promise<Response>
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse('UNAUTHORIZED', '인증이 필요합니다', 401);
  }

  return handler(user.id, supabase);
}
```

### Step 2: 모듈 API

```typescript
// src/app/api/v1/modules/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { withAuth } from '@/lib/utils/api-auth';

export async function GET(request: NextRequest) {
  return withAuth(async (userId, supabase) => {
    // 모듈 목록 조회 (진행 상황 포함)
    const { data: modules, error } = await supabase
      .from('modules')
      .select(`
        *,
        user_progress!left(status, current_step, completed_at)
      `)
      .eq('is_active', true)
      .eq('user_progress.user_id', userId)
      .order('order_index');

    if (error) {
      return errorResponse('FETCH_ERROR', error.message, 500);
    }

    return successResponse(modules);
  });
}
```

```typescript
// src/app/api/v1/modules/[id]/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { withAuth } from '@/lib/utils/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (userId, supabase) => {
    const { data: module, error } = await supabase
      .from('modules')
      .select(`
        *,
        scenarios(*),
        user_progress!left(*)
      `)
      .eq('id', params.id)
      .eq('user_progress.user_id', userId)
      .single();

    if (error) {
      return errorResponse('NOT_FOUND', '모듈을 찾을 수 없습니다', 404);
    }

    return successResponse(module);
  });
}
```

```typescript
// src/app/api/v1/modules/[id]/start/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { withAuth } from '@/lib/utils/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (userId, supabase) => {
    const body = await request.json();
    const { scenarioId } = body;

    // 진행 상황 생성 또는 업데이트
    const { data: progress, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: params.id,
        scenario_id: scenarioId,
        status: 'in_progress',
        current_step: 'dialogue',
        started_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,module_id',
      })
      .select()
      .single();

    if (error) {
      return errorResponse('START_ERROR', error.message, 500);
    }

    // 대화 레코드 생성
    await supabase.from('dialogues').insert({
      progress_id: progress.id,
      messages: [],
    });

    return successResponse(progress);
  });
}
```

### Step 3: 대화 API

```typescript
// src/app/api/v1/dialogues/[id]/messages/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { withAuth } from '@/lib/utils/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (userId, supabase) => {
    const { content } = await request.json();

    // 기존 대화 조회
    const { data: dialogue } = await supabase
      .from('dialogues')
      .select('*, user_progress!inner(user_id)')
      .eq('id', params.id)
      .eq('user_progress.user_id', userId)
      .single();

    if (!dialogue) {
      return errorResponse('NOT_FOUND', '대화를 찾을 수 없습니다', 404);
    }

    // 메시지 추가
    const newMessage = {
      role: 'student',
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...dialogue.messages, newMessage];

    const { data, error } = await supabase
      .from('dialogues')
      .update({ messages: updatedMessages })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return errorResponse('UPDATE_ERROR', error.message, 500);
    }

    return successResponse(data);
  });
}
```

### Step 4: AI 스트리밍 API

```typescript
// src/app/api/v1/ai/stream/dialogue/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { progressId, message, moduleSlug } = await request.json();

  // 시스템 프롬프트 로드 (모듈별)
  const systemPrompt = await loadSocraticPrompt(moduleSlug);

  // 이전 대화 컨텍스트 조회
  const { data: dialogue } = await supabase
    .from('dialogues')
    .select('messages')
    .eq('progress_id', progressId)
    .single();

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...(dialogue?.messages || []).map((m: any) => ({
      role: m.role === 'student' ? 'user' as const : 'assistant' as const,
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // 스트리밍 응답 생성
  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    messages,
    stream: true,
  });

  // SSE 스트림 반환
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
        );
      }

      // 완료 후 대화 저장
      await saveDialogueMessage(supabase, progressId, message, fullResponse);

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function loadSocraticPrompt(moduleSlug: string): Promise<string> {
  // prompts/ 폴더에서 해당 모듈의 시스템 프롬프트 로드
  // 실제 구현 시 파일 시스템 또는 DB에서 로드
  return `You are a Socratic tutor teaching ${moduleSlug} technique...`;
}

async function saveDialogueMessage(
  supabase: any,
  progressId: string,
  userMessage: string,
  aiResponse: string
) {
  const { data: dialogue } = await supabase
    .from('dialogues')
    .select('messages')
    .eq('progress_id', progressId)
    .single();

  const updatedMessages = [
    ...(dialogue?.messages || []),
    { role: 'student', content: userMessage, timestamp: new Date().toISOString() },
    { role: 'tutor', content: aiResponse, timestamp: new Date().toISOString() },
  ];

  await supabase
    .from('dialogues')
    .update({ messages: updatedMessages })
    .eq('progress_id', progressId);
}
```

### Step 5: 프롬프트 제출 API

```typescript
// src/app/api/v1/prompts/submit/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { withAuth } from '@/lib/utils/api-auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  return withAuth(async (userId, supabase) => {
    const { progressId, prompt } = await request.json();

    const startTime = Date.now();

    // AI 응답 생성
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseTime = Date.now() - startTime;
    const aiResponse = completion.choices[0]?.message?.content || '';

    // 시도 횟수 조회
    const { count } = await supabase
      .from('prompt_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('progress_id', progressId);

    // 프롬프트 시도 저장
    const { data, error } = await supabase
      .from('prompt_attempts')
      .insert({
        progress_id: progressId,
        user_prompt: prompt,
        ai_response: aiResponse,
        model_used: process.env.OPENAI_MODEL,
        tokens_used: completion.usage?.total_tokens,
        response_time_ms: responseTime,
        attempt_number: (count || 0) + 1,
      })
      .select()
      .single();

    if (error) {
      return errorResponse('SUBMIT_ERROR', error.message, 500);
    }

    return successResponse(data);
  });
}
```

### Step 6: 비교 분석 API

```typescript
// src/app/api/v1/comparisons/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { withAuth } from '@/lib/utils/api-auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  return withAuth(async (userId, supabase) => {
    const { progressId, basicPrompt, optimizedPrompt } = await request.json();

    // 두 프롬프트에 대한 AI 응답 생성
    const [basicResult, optimizedResult] = await Promise.all([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: basicPrompt }],
      }),
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: optimizedPrompt }],
      }),
    ]);

    const basicResponse = basicResult.choices[0]?.message?.content || '';
    const optimizedResponse = optimizedResult.choices[0]?.message?.content || '';

    // 6차원 분석 생성
    const analysisPrompt = `
      두 프롬프트를 비교 분석하세요:
      
      기본 프롬프트: ${basicPrompt}
      최적화 프롬프트: ${optimizedPrompt}
      
      다음 6가지 차원에서 1-5점으로 평가하고 JSON으로 반환:
      - specificity: 구체성
      - context: 맥락 제공
      - persona: 역할 설정
      - output_format: 출력 형식
      - constraints: 제약 조건
      - examples: 예시 포함
      
      각 차원에 basic_score, optimized_score, explanation 포함.
    `;

    const analysisResult = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: analysisPrompt }],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(
      analysisResult.choices[0]?.message?.content || '{}'
    );

    // 비교 결과 저장
    const { data, error } = await supabase
      .from('comparisons')
      .insert({
        progress_id: progressId,
        basic_prompt: basicPrompt,
        optimized_prompt: optimizedPrompt,
        basic_response: basicResponse,
        optimized_response: optimizedResponse,
        analysis,
      })
      .select()
      .single();

    if (error) {
      return errorResponse('COMPARISON_ERROR', error.message, 500);
    }

    return successResponse(data);
  });
}
```

---

## ✅ 완료 조건

- [ ] 모든 API 엔드포인트 구현
- [ ] 인증 미들웨어 동작
- [ ] AI 스트리밍 정상 작동
- [ ] 에러 응답 형식 일관성
- [ ] `docs/API-SPEC.md`와 일치

---

## ➡️ 다음 단계

API 완료 후 → **UI Agent**와 통합 테스트
