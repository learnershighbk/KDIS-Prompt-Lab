# Prompt Lab 컴포넌트 구조

## 1. 컴포넌트 설계 원칙

### 1.1 Atomic Design 적용

```
atoms/        → UI 기본 요소 (Button, Input, Badge)
molecules/    → 조합 컴포넌트 (ChatBubble, ProgressBar)
organisms/    → 복합 컴포넌트 (DialogueContainer, ModuleCard)
templates/    → 페이지 레이아웃 (DashboardLayout)
pages/        → 실제 페이지 (app/ 디렉토리)
```

### 1.2 컴포넌트 분류

| 유형 | 위치 | 역할 |
|------|------|------|
| UI Components | `src/components/ui/` | 재사용 가능한 기본 UI (shadcn/ui) |
| Feature Components | `src/features/[feature]/components/` | 비즈니스 로직 포함 (피처별) |
| Layout Components | `src/components/layouts/` | 페이지 구조 |
| Common Components | `src/components/common/` | 공통 유틸리티 |

> **참조**: AGENTS.md 디렉토리 구조 기준. 피처 컴포넌트는 `src/features/[featureName]/components/` 에 위치

## 2. UI 컴포넌트 (shadcn/ui 기반)

### 2.1 기본 컴포넌트 목록

```typescript
// src/components/ui/index.ts

// Form Elements
export { Button } from './button';
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';
export { Checkbox } from './checkbox';
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

// Layout
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Separator } from './separator';
export { ScrollArea } from './scroll-area';

// Feedback
export { Progress } from './progress';
export { Badge } from './badge';
export { Alert, AlertTitle, AlertDescription } from './alert';
export { Skeleton } from './skeleton';

// Overlay
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
export { Sheet, SheetTrigger, SheetContent } from './sheet';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';

// Navigation
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { NavigationMenu } from './navigation-menu';

// Data Display
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
```

### 2.2 커스텀 UI 컴포넌트

```typescript
// src/components/ui/step-progress.tsx

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (index: number) => void;
}

export function StepProgress({ 
  steps, 
  currentStep, 
  completedSteps,
  onStepClick 
}: StepProgressProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <StepCircle
            label={step}
            number={index + 1}
            status={
              completedSteps.includes(index)
                ? 'completed'
                : index === currentStep
                ? 'current'
                : 'upcoming'
            }
            onClick={() => onStepClick?.(index)}
          />
          {index < steps.length - 1 && <StepConnector />}
        </div>
      ))}
    </div>
  );
}
```

## 3. Feature 컴포넌트

### 3.1 인증 (Auth)

```typescript
// src/features/auth/components/login-form.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth.store';
import { Button, Input, Label } from '@/components/ui';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@kdis.ac.kr"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
```

```typescript
// src/features/auth/components/auth-guard.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'instructor' | 'admin';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (requiredRole && user && !user.roles.includes(requiredRole)) {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 3.2 모듈 (Modules)

```typescript
// src/features/modules/components/module-card.tsx

import Link from 'next/link';
import { Lock, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Progress } from '@/components/ui';
import type { ModuleWithProgress } from '@/domain/entities/module.entity';

interface ModuleCardProps {
  module: ModuleWithProgress;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const statusIcon = {
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    in_progress: <PlayCircle className="h-5 w-5 text-blue-500" />,
    not_started: <Circle className="h-5 w-5 text-gray-400" />,
  };

  const progressPercentage = module.progress
    ? (module.progress.completedSteps / 4) * 100
    : 0;

  if (module.isLocked) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Lock className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-muted-foreground">잠김</span>
          </div>
          <CardTitle className="text-lg">{module.title}</CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {module.techniques.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            이전 모듈 완료 후 해제
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/modules/${module.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            {statusIcon[module.progress?.status || 'not_started']}
            <span className="text-sm text-muted-foreground">
              {module.progress?.status === 'completed' ? '완료' : 
               module.progress?.status === 'in_progress' ? '진행중' : '시작 전'}
            </span>
          </div>
          <CardTitle className="text-lg">
            Module {module.orderIndex}: {module.title}
          </CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-2" />
          <div className="flex flex-wrap gap-1">
            {module.techniques.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                🏷️ {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

```typescript
// src/features/modules/components/step-indicator.tsx

import { Check, Circle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepType } from '@/domain/entities/module.entity';
import { STEP_TITLES } from '@/lib/constants';

interface StepIndicatorProps {
  steps: StepType[];
  currentStep: StepType;
  completedSteps: StepType[];
  language?: 'ko' | 'en';
}

export function StepIndicator({ 
  steps, 
  currentStep, 
  completedSteps,
  language = 'ko'
}: StepIndicatorProps) {
  const getStepStatus = (step: StepType) => {
    if (completedSteps.includes(step)) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step);
        
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                  {
                    'border-green-500 bg-green-500 text-white': status === 'completed',
                    'border-blue-500 bg-blue-500 text-white': status === 'current',
                    'border-gray-300 bg-white text-gray-400': status === 'upcoming',
                  }
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : status === 'current' ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <span className={cn(
                'mt-1 text-xs',
                status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
              )}>
                {STEP_TITLES[step][language]}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8',
                  completedSteps.includes(steps[index + 1])
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 3.3 소크라테스 대화 (Socratic Dialogue)

```typescript
// src/features/socratic-dialogue/components/dialogue-container.tsx

'use client';

import { useRef, useEffect } from 'react';
import { useDialogue } from '@/hooks/useDialogue';
import { ChatBubble } from './chat-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { DialogueComplete } from './dialogue-complete';
import { ScrollArea } from '@/components/ui';

interface DialogueContainerProps {
  progressId: string;
  onComplete: () => void;
}

export function DialogueContainer({ progressId, onComplete }: DialogueContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    dialogue,
    isLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    canProceed,
  } = useDialogue(progressId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dialogue?.messages, streamingContent]);

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">소크라테스 대화</h3>
        <p className="text-sm text-muted-foreground">
          AI 튜터와의 대화를 통해 프롬프트 엔지니어링의 핵심 원리를 탐구해보세요.
        </p>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {dialogue?.messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {isStreaming && (
            <ChatBubble
              message={{
                id: 'streaming',
                role: 'tutor',
                content: streamingContent,
                timestamp: new Date(),
              }}
              isStreaming
            />
          )}
          
          {isLoading && !isStreaming && <TypingIndicator />}
        </div>
      </ScrollArea>

      {dialogue?.isCompleted && canProceed ? (
        <DialogueComplete onProceed={onComplete} />
      ) : (
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || isStreaming}
          placeholder="생각을 입력해주세요..."
        />
      )}
    </div>
  );
}
```

```typescript
// src/features/socratic-dialogue/components/chat-bubble.tsx

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import type { DialogueMessage } from '@/domain/entities/dialogue.entity';
import { QUESTION_TYPE_LABELS } from '@/lib/constants';

interface ChatBubbleProps {
  message: DialogueMessage;
  isStreaming?: boolean;
}

export function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  const isTutor = message.role === 'tutor';

  return (
    <div
      className={cn(
        'flex gap-3',
        isTutor ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <Avatar className="h-8 w-8">
        {isTutor ? (
          <>
            <AvatarImage src="/images/tutor-avatar.png" />
            <AvatarFallback>🎓</AvatarFallback>
          </>
        ) : (
          <AvatarFallback>👤</AvatarFallback>
        )}
      </Avatar>

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isTutor
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isTutor && message.questionType && (
          <span className="mb-1 block text-xs text-muted-foreground">
            {QUESTION_TYPE_LABELS[message.questionType].ko}
          </span>
        )}
        
        <p className="whitespace-pre-wrap text-sm">
          {message.content}
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
          )}
        </p>
      </div>
    </div>
  );
}
```

### 3.4 비교 실험실 (Comparison Lab)

```typescript
// src/features/comparison-lab/components/comparison-panel.tsx

'use client';

import { useState } from 'react';
import { Card, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from '@/components/ui';
import { SideBySide } from './side-by-side';
import { AnalysisChart } from './analysis-chart';
import { DifferenceHighlight } from './difference-highlight';
import type { Comparison } from '@/domain/entities/comparison.entity';

interface ComparisonPanelProps {
  comparison: Comparison;
}

export function ComparisonPanel({ comparison }: ComparisonPanelProps) {
  const [view, setView] = useState<'prompts' | 'responses' | 'analysis'>('prompts');

  return (
    <Card className="p-6">
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompts">프롬프트 비교</TabsTrigger>
          <TabsTrigger value="responses">응답 비교</TabsTrigger>
          <TabsTrigger value="analysis">분석 결과</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="mt-4">
          <SideBySide
            leftTitle="내 프롬프트"
            leftContent={comparison.userPrompt}
            rightTitle="개선된 프롬프트"
            rightContent={comparison.improvedPrompt}
          />
          <DifferenceHighlight
            original={comparison.userPrompt}
            improved={comparison.improvedPrompt}
          />
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <SideBySide
            leftTitle="내 프롬프트 결과"
            leftContent={comparison.userResponse}
            rightTitle="개선된 프롬프트 결과"
            rightContent={comparison.improvedResponse}
          />
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <AnalysisChart analysis={comparison.analysis} />
          
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium">핵심 차이점</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {comparison.analysis.keyDifferences.map((diff, i) => (
                  <li key={i}>{diff}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">개선 제안</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {comparison.analysis.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
```

```typescript
// src/features/comparison-lab/components/analysis-chart.tsx

'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PromptAnalysis } from '@/domain/entities/comparison.entity';

interface AnalysisChartProps {
  analysis: PromptAnalysis;
}

const DIMENSION_LABELS: Record<string, string> = {
  specificity: '구체성',
  context: '맥락',
  persona: '페르소나',
  outputFormat: '출력 형식',
  constraints: '제약 조건',
  examples: '예시',
};

export function AnalysisChart({ analysis }: AnalysisChartProps) {
  const data = Object.entries(DIMENSION_LABELS).map(([key, label]) => ({
    dimension: label,
    score: analysis[key as keyof PromptAnalysis]?.score || 0,
    fullMark: 5,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" className="text-sm" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar
            name="프롬프트 분석"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center">
        <span className="text-2xl font-bold">
          {analysis.overallScore.toFixed(1)}
        </span>
        <span className="text-muted-foreground"> / 5.0</span>
      </div>
    </div>
  );
}
```

### 3.5 성찰 저널 (Reflection Journal)

```typescript
// src/features/reflection-journal/components/reflection-form.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reflectionSchema, type ReflectionInput } from '@/lib/validations';
import { Button, Textarea, Label, Card } from '@/components/ui';
import { InsightTags } from './insight-tags';

interface ReflectionFormProps {
  progressId: string;
  guidingQuestions: string[];
  onSubmit: (data: ReflectionInput) => Promise<void>;
}

export function ReflectionForm({ 
  progressId, 
  guidingQuestions, 
  onSubmit 
}: ReflectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyLearnings, setKeyLearnings] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReflectionInput>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: {
      progressId,
    },
  });

  const handleFormSubmit = async (data: ReflectionInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        insights: {
          keyLearnings,
          nextSteps: [],
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="p-4">
        <h4 className="mb-3 font-medium">성찰 질문</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {guidingQuestions.map((q, i) => (
            <li key={i}>• {q}</li>
          ))}
        </ul>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="content">성찰 내용</Label>
        <Textarea
          id="content"
          placeholder="오늘 학습을 통해 깨달은 점을 자유롭게 작성해주세요..."
          className="min-h-[200px]"
          {...register('content')}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>핵심 학습 포인트 (태그 추가)</Label>
        <InsightTags
          tags={keyLearnings}
          onAdd={(tag) => setKeyLearnings([...keyLearnings, tag])}
          onRemove={(tag) => setKeyLearnings(keyLearnings.filter((t) => t !== tag))}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? '저장 중...' : '성찰 저장 및 모듈 완료'}
      </Button>
    </form>
  );
}
```

### 3.6 진도 관리 (Progress)

```typescript
// src/features/progress/components/progress-overview.tsx

import { Card, CardHeader, CardTitle, CardContent, Progress } from '@/components/ui';
import { BadgeDisplay } from './badge-display';
import { ActivityTimeline } from './activity-timeline';
import type { OverallProgress, BadgeWithModule } from '@/domain/entities';

interface ProgressOverviewProps {
  progress: OverallProgress;
  badges: BadgeWithModule[];
}

export function ProgressOverview({ progress, badges }: ProgressOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>📊 나의 학습 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  className="stroke-primary transition-all duration-300"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeDasharray={`${progress.percentage * 2.51} 251`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{progress.percentage}%</span>
              </div>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground">
            {progress.completedModules}/{progress.totalModules} 모듈 완료
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏆 획득한 테크닉</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeDisplay badges={badges} />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 4. Layout 컴포넌트

```typescript
// src/components/layouts/dashboard-layout.tsx

import { Header } from './header';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

```typescript
// src/components/layouts/header.tsx

'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useProgressStore } from '@/stores/progress.store';
import { Button, Avatar, AvatarFallback, DropdownMenu } from '@/components/ui';
import { LanguageSwitcher } from '@/components/common/language-switcher';

export function Header() {
  const { user, logout } = useAuthStore();
  const { overallProgress } = useProgressStore();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">🎓 Prompt Lab</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/modules" className="text-sm font-medium hover:text-primary">
            학습 모듈
          </Link>
          <Link href="/resources" className="text-sm font-medium hover:text-primary">
            📚 학습 리소스
          </Link>
          <Link href="/journal" className="text-sm font-medium hover:text-primary">
            마이페이지
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* 미니 진도 표시 */}
          {overallProgress && (
            <div className="hidden items-center gap-2 md:flex">
              <MiniProgressIndicator progress={overallProgress} />
            </div>
          )}

          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.profile.fullName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">프로필 설정</Link>
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

## 5. Common 컴포넌트

```typescript
// src/components/common/loading-spinner.tsx

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}
```

```typescript
// src/components/common/empty-state.tsx

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```
