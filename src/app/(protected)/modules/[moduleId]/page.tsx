'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  PenTool,
  GitCompare,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Play,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface ModuleDetail {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  objectives: string[];
  techniques: string[];
  estimatedMinutes: number;
}

interface StepInfo {
  type: 'socratic_dialogue' | 'prompt_writing' | 'comparison_lab' | 'reflection_journal';
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'locked';
}

type ModuleDetailPageProps = {
  params: Promise<{ moduleId: string }>;
};

const stepMeta = {
  socratic_dialogue: {
    title: '소크라테스 대화',
    description: 'AI와의 대화를 통해 개념을 탐구하고 이해를 심화합니다.',
    icon: <MessageSquare className="h-6 w-6" />,
  },
  prompt_writing: {
    title: '프롬프트 작성',
    description: '학습한 내용을 바탕으로 실제 프롬프트를 작성해봅니다.',
    icon: <PenTool className="h-6 w-6" />,
  },
  comparison_lab: {
    title: '비교 실험실',
    description: '다양한 프롬프트를 비교하고 효과를 분석합니다.',
    icon: <GitCompare className="h-6 w-6" />,
  },
  reflection_journal: {
    title: '성찰 저널',
    description: '학습 경험을 정리하고 인사이트를 기록합니다.',
    icon: <BookOpen className="h-6 w-6" />,
  },
};

const moduleData: Record<string, ModuleDetail> = {
  '11111111-1111-1111-1111-111111111111': {
    id: '11111111-1111-1111-1111-111111111111',
    orderIndex: 1,
    title: '좋은 질문이 좋은 답을 만든다',
    description: '효과적인 프롬프트 작성의 기초를 배웁니다. 구체적이고 명확한 질문을 통해 AI로부터 원하는 답변을 얻는 방법을 익힙니다.',
    objectives: [
      '명확한 질문의 중요성 이해',
      '구체적인 컨텍스트 제공 방법 학습',
      '단계적 질문 기법 습득',
    ],
    techniques: ['명확성', '구체성', '맥락 제공'],
    estimatedMinutes: 45,
  },
  '22222222-2222-2222-2222-222222222222': {
    id: '22222222-2222-2222-2222-222222222222',
    orderIndex: 2,
    title: '문헌 리뷰 효과적으로 하기',
    description: 'AI를 활용하여 학술 문헌을 효율적으로 검토하고 분석하는 방법을 학습합니다.',
    objectives: [
      '문헌 요약 요청 기법 습득',
      '핵심 논점 추출 방법 학습',
      '비판적 분석 요청 방법 익히기',
    ],
    techniques: ['요약', '분석', '비교'],
    estimatedMinutes: 50,
  },
  '33333333-3333-3333-3333-333333333333': {
    id: '33333333-3333-3333-3333-333333333333',
    orderIndex: 3,
    title: '정책 비교 분석 요청하기',
    description: '다양한 정책 옵션을 체계적으로 비교 분석하는 프롬프트 작성법을 배웁니다.',
    objectives: [
      '비교 기준 설정 방법 이해',
      '다각적 분석 요청 기법 습득',
      '장단점 분석 프레임워크 활용',
    ],
    techniques: ['비교 분석', '기준 설정', '체계적 평가'],
    estimatedMinutes: 55,
  },
  '44444444-4444-4444-4444-444444444444': {
    id: '44444444-4444-4444-4444-444444444444',
    orderIndex: 4,
    title: '데이터 해석 도움받기',
    description: 'AI를 활용하여 데이터를 해석하고 인사이트를 도출하는 방법을 학습합니다.',
    objectives: [
      '데이터 설명 기법 습득',
      '해석 요청 방법 학습',
      '시각화 제안 요청 방법 익히기',
    ],
    techniques: ['데이터 설명', '해석 요청', '인사이트 도출'],
    estimatedMinutes: 50,
  },
  '55555555-5555-5555-5555-555555555555': {
    id: '55555555-5555-5555-5555-555555555555',
    orderIndex: 5,
    title: '정책 문서 작성 지원받기',
    description: '정책 브리프, 보고서 등 다양한 정책 문서 작성에 AI를 활용하는 방법을 배웁니다.',
    objectives: [
      '문서 구조화 요청 방법 습득',
      '초안 작성 지원 활용법 학습',
      '수정 및 개선 요청 기법 익히기',
    ],
    techniques: ['구조화', '초안 작성', '수정 요청'],
    estimatedMinutes: 60,
  },
};

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const data = moduleData[moduleId];
    if (data) {
      setModule(data);
    }
    setIsLoading(false);
  }, [moduleId]);

  const stepTypes: Array<'socratic_dialogue' | 'prompt_writing' | 'comparison_lab' | 'reflection_journal'> = [
    'socratic_dialogue',
    'prompt_writing',
    'comparison_lab',
    'reflection_journal',
  ];

  const steps: StepInfo[] = stepTypes.map((type, index) => ({
    type,
    ...stepMeta[type],
    status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'locked',
  }));

  const getStepIcon = (step: StepInfo, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (step.status === 'current') {
      return <Play className="h-5 w-5 text-primary" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const handleStartStep = (stepIndex: number) => {
    const stepType = stepTypes[stepIndex];
    router.push(`${ROUTES.MODULE(moduleId)}/${stepType}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">모듈을 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mt-2">요청하신 모듈이 존재하지 않습니다.</p>
        <Button className="mt-4" asChild>
          <Link href={ROUTES.MODULES}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            모듈 목록으로 돌아가기
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={ROUTES.MODULES}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            모듈 목록
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              Module {module.orderIndex}
            </Badge>
            <h1 className="text-4xl font-bold">{module.title}</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{module.description}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{module.estimatedMinutes}분</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>학습 목표</CardTitle>
            <CardDescription>이 모듈을 완료하면 다음을 할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {module.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-base">{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>습득 기술</CardTitle>
            <CardDescription>이 모듈에서 배우는 프롬프트 기법</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {module.techniques.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm py-1 px-3">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학습 단계</CardTitle>
          <CardDescription>
            4단계로 구성된 학습 과정을 순서대로 진행하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.type}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  step.status === 'current' && 'border-primary bg-primary/5',
                  step.status === 'locked' && 'opacity-60'
                )}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {getStepIcon(step, index)}
                </div>

                <div className="flex-shrink-0 text-muted-foreground">
                  {step.icon}
                </div>

                <div className="flex-1">
                  <div className="text-base font-medium">
                    Step {index + 1}: {step.title}
                  </div>
                  <div className="text-base text-muted-foreground">
                    {step.description}
                  </div>
                </div>

                <Button
                  variant={step.status === 'current' ? 'default' : 'outline'}
                  size="sm"
                  disabled={step.status === 'locked'}
                  onClick={() => handleStartStep(index)}
                >
                  {step.status === 'completed'
                    ? '다시 하기'
                    : step.status === 'current'
                    ? '시작하기'
                    : '잠김'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" onClick={() => handleStartStep(currentStep)}>
          {currentStep === 0 ? '학습 시작하기' : '이어서 학습하기'}
        </Button>
      </div>
    </div>
  );
}
