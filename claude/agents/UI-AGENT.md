# UI Agent Instructions

> UI 컴포넌트 및 페이지 구현 담당 에이전트

## 🎯 역할 및 책임

1. **컴포넌트 구현**: shadcn/ui 기반 커스텀 컴포넌트
2. **페이지 구현**: Next.js App Router 페이지
3. **상태 연결**: Zustand Store 및 React Query 연동
4. **반응형 디자인**: 모바일/데스크톱 지원

## 📚 필수 참조 문서

- `docs/COMPONENT-STRUCTURE.md` - 컴포넌트 설계
- `docs/STATE-MANAGEMENT.md` - 상태 관리
- `docs/PROJECT-STRUCTURE.md` - 폴더 구조

---

## 📋 작업 체크리스트

### Step 1: 레이아웃 컴포넌트

```typescript
// src/components/layouts/Header.tsx
'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/constants/routes';

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-500">Prompt Lab</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href={ROUTES.DASHBOARD} className="text-sm hover:text-primary-500">
            모듈
          </Link>
          <Link href={ROUTES.JOURNAL} className="text-sm hover:text-primary-500">
            성찰 저널
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback>
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.PROFILE}>프로필</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

```typescript
// src/components/layouts/DashboardLayout.tsx
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Step 2: 모듈 카드 컴포넌트

```typescript
// src/components/features/modules/ModuleCard.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Play } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import type { ModuleWithProgress } from '@/types';
import { cn } from '@/lib/utils/cn';

interface ModuleCardProps {
  module: ModuleWithProgress;
  isLocked?: boolean;
}

export function ModuleCard({ module, isLocked = false }: ModuleCardProps) {
  const progress = module.user_progress?.[0];
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  const getStepProgress = () => {
    if (!progress) return 0;
    const steps = ['dialogue', 'prompt_writing', 'comparison', 'reflection'];
    const currentIndex = steps.indexOf(progress.current_step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  if (isLocked) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{module.title_ko}</CardTitle>
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{module.description_ko}</p>
          <p className="mt-2 text-xs text-gray-400">이전 모듈을 완료하세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={ROUTES.MODULE(module.id)}>
      <Card className={cn(
        'transition-all hover:shadow-lg hover:border-primary-300',
        isCompleted && 'border-green-300 bg-green-50'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{module.title_ko}</CardTitle>
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : isInProgress ? (
              <Play className="h-5 w-5 text-primary-500" />
            ) : null}
          </div>
          <Badge variant="secondary" className="w-fit">
            {module.technique}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{module.description_ko}</p>
          
          {isInProgress && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>진행률</span>
                <span>{Math.round(getStepProgress())}%</span>
              </div>
              <Progress value={getStepProgress()} />
            </div>
          )}
          
          <p className="mt-3 text-xs text-gray-400">
            예상 소요 시간: {module.estimated_time}분
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Step 3: Socratic Dialogue 컴포넌트

```typescript
// src/components/features/dialogue/DialogueContainer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useDialogueStore } from '@/stores/dialogueStore';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DialogueContainerProps {
  progressId: string;
  moduleSlug: string;
}

export function DialogueContainer({ progressId, moduleSlug }: DialogueContainerProps) {
  const { currentDialogue, isStreaming, streamingContent, addMessage } = useDialogueStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 스크롤 하단으로
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentDialogue?.messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');

    // 스트리밍 API 호출
    const response = await fetch('/api/v1/ai/stream/dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressId, message: userMessage, moduleSlug }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const { content } = JSON.parse(data);
            // 스트리밍 콘텐츠 업데이트
            useDialogueStore.getState().updateStreamingContent(content);
          } catch {}
        }
      }
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-white">
      <div className="border-b p-4">
        <h3 className="font-semibold">Socratic Dialogue</h3>
        <p className="text-sm text-gray-500">AI 튜터와 대화하며 학습하세요</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentDialogue?.messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}
          
          {isStreaming && (
            <>
              <ChatBubble role="tutor" content={streamingContent} isStreaming />
              <TypingIndicator />
            </>
          )}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isStreaming}
      />
    </div>
  );
}
```

```typescript
// src/components/features/dialogue/ChatBubble.tsx
import { cn } from '@/lib/utils/cn';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'tutor' | 'student';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, timestamp, isStreaming }: ChatBubbleProps) {
  const isTutor = role === 'tutor';

  return (
    <div className={cn('flex gap-3', !isTutor && 'flex-row-reverse')}>
      <Avatar className={cn(
        'h-8 w-8',
        isTutor ? 'bg-primary-100' : 'bg-accent-100'
      )}>
        <AvatarFallback>
          {isTutor ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        'max-w-[80%] rounded-lg px-4 py-2',
        isTutor ? 'bg-gray-100' : 'bg-primary-500 text-white'
      )}>
        <p className={cn(
          'text-sm whitespace-pre-wrap',
          isStreaming && 'animate-pulse'
        )}>
          {content}
        </p>
        {timestamp && (
          <p className={cn(
            'mt-1 text-xs',
            isTutor ? 'text-gray-400' : 'text-primary-200'
          )}>
            {new Date(timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Comparison Lab 컴포넌트

```typescript
// src/components/features/comparison/ComparisonPanel.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SideBySide } from './SideBySide';
import { AnalysisChart } from './AnalysisChart';
import type { Comparison } from '@/types';

interface ComparisonPanelProps {
  comparison: Comparison;
}

export function ComparisonPanel({ comparison }: ComparisonPanelProps) {
  const [activeTab, setActiveTab] = useState('prompts');

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">비교 분석 Lab</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="prompts">프롬프트</TabsTrigger>
          <TabsTrigger value="responses">AI 응답</TabsTrigger>
          <TabsTrigger value="analysis">분석 결과</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts">
          <SideBySide
            leftTitle="기본 프롬프트"
            leftContent={comparison.basic_prompt}
            rightTitle="최적화 프롬프트"
            rightContent={comparison.optimized_prompt}
          />
        </TabsContent>

        <TabsContent value="responses">
          <SideBySide
            leftTitle="기본 응답"
            leftContent={comparison.basic_response}
            rightTitle="최적화 응답"
            rightContent={comparison.optimized_response}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisChart analysis={comparison.analysis} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

```typescript
// src/components/features/comparison/AnalysisChart.tsx
'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PromptAnalysis } from '@/types';

interface AnalysisChartProps {
  analysis: PromptAnalysis;
}

const DIMENSION_LABELS: Record<string, string> = {
  specificity: '구체성',
  context: '맥락',
  persona: '역할',
  output_format: '출력 형식',
  constraints: '제약 조건',
  examples: '예시',
};

export function AnalysisChart({ analysis }: AnalysisChartProps) {
  const data = Object.entries(analysis.dimensions || {}).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key] || key,
    basic: value.basic_score,
    optimized: value.optimized_score,
  }));

  return (
    <div className="space-y-6">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis domain={[0, 5]} />
            <Radar
              name="기본"
              dataKey="basic"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.3}
            />
            <Radar
              name="최적화"
              dataKey="optimized"
              stroke="#003366"
              fill="#003366"
              fillOpacity={0.3}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">상세 분석</h4>
        {Object.entries(analysis.dimensions || {}).map(([key, value]) => (
          <div key={key} className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{DIMENSION_LABELS[key]}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">기본: {value.basic_score}/5</span>
                <span className="text-primary-500">최적화: {value.optimized_score}/5</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{value.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 5: 성찰 저널 컴포넌트

```typescript
// src/components/features/reflection/ReflectionForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const reflectionSchema = z.object({
  content: z.string().min(50, '50자 이상 작성해주세요'),
  keyLearnings: z.string().min(10, '핵심 학습 내용을 입력하세요'),
  selfRating: z.number().min(1).max(5),
});

type ReflectionInput = z.infer<typeof reflectionSchema>;

interface ReflectionFormProps {
  progressId: string;
  moduleTechnique: string;
  onSubmit: (data: ReflectionInput) => Promise<void>;
}

export function ReflectionForm({ progressId, moduleTechnique, onSubmit }: ReflectionFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReflectionInput>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: { selfRating: 3 },
  });

  const guideQuestions = [
    `${moduleTechnique} 기법을 통해 무엇을 배웠나요?`,
    '이 기법을 정책 분석에 어떻게 적용할 수 있을까요?',
    '학습 과정에서 어떤 어려움이 있었나요?',
    '다음에 다르게 시도해보고 싶은 것은 무엇인가요?',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>성찰 저널</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-primary-600">가이드 질문</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {guideQuestions.map((q, i) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              오늘의 학습 성찰
            </label>
            <Textarea
              {...register('content')}
              placeholder="학습 경험을 자유롭게 작성하세요..."
              rows={6}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              핵심 학습 내용 (쉼표로 구분)
            </label>
            <Textarea
              {...register('keyLearnings')}
              placeholder="예: Chain of Thought, 단계별 추론, 문제 분해"
              rows={2}
            />
            {errors.keyLearnings && (
              <p className="mt-1 text-sm text-red-500">{errors.keyLearnings.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              자기 평가 (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    {...register('selfRating', { valueAsNumber: true })}
                    value={n}
                    className="sr-only"
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 hover:border-primary-500">
                    {n}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '성찰 완료 및 배지 획득'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Step 6: 페이지 구현

```typescript
// src/app/(dashboard)/modules/page.tsx
import { createServerSupabaseClient } from '@/infrastructure/supabase/server';
import { ModuleCard } from '@/components/features/modules/ModuleCard';

export default async function ModulesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      user_progress!left(status, current_step)
    `)
    .eq('is_active', true)
    .eq('user_progress.user_id', user?.id)
    .order('order_index');

  // 선수 과목 체크
  const completedModules = new Set(
    modules
      ?.filter((m) => m.user_progress?.[0]?.status === 'completed')
      .map((m) => m.id)
  );

  const isModuleLocked = (module: any) => {
    if (!module.prerequisites?.length) return false;
    return !module.prerequisites.every((prereq: string) => 
      completedModules.has(prereq)
    );
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">학습 모듈</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules?.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isLocked={isModuleLocked(module)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ 완료 조건

- [ ] 모든 레이아웃 컴포넌트 구현
- [ ] 모듈 카드 및 목록 페이지
- [ ] Socratic Dialogue UI (스트리밍)
- [ ] Comparison Lab (레이더 차트)
- [ ] 성찰 저널 폼
- [ ] 반응형 디자인 확인

---

## ➡️ 다음 단계

UI 완료 후 → **Orchestrator**와 통합 테스트
