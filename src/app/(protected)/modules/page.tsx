'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  ArrowRight,
  Search,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';

interface ModuleWithProgress {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  objectives: string[];
  techniques: string[];
  estimatedMinutes: number;
  progress: {
    status: 'not_started' | 'in_progress' | 'completed';
    currentStep: string | null;
    stepsCompleted: number;
    totalSteps: number;
  } | null;
  isUnlocked: boolean;
}

type ModulesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ModulesPage({ params }: ModulesPageProps) {
  void params;
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setModules([
      {
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
        progress: null,
        isUnlocked: true,
      },
      {
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
        progress: null,
        isUnlocked: false,
      },
      {
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
        progress: null,
        isUnlocked: false,
      },
      {
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
        progress: null,
        isUnlocked: false,
      },
      {
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
        progress: null,
        isUnlocked: false,
      },
    ]);
    setIsLoading(false);
  }, []);

  const getStatusIcon = (module: ModuleWithProgress) => {
    if (!module.isUnlocked) {
      return <Lock className="h-6 w-6 text-muted-foreground" />;
    }
    if (module.progress?.status === 'completed') {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if (module.progress?.status === 'in_progress') {
      return <Clock className="h-6 w-6 text-blue-500" />;
    }
    return <BookOpen className="h-6 w-6 text-primary" />;
  };

  const getStatusBadge = (module: ModuleWithProgress) => {
    if (!module.isUnlocked) {
      return <Badge variant="secondary">잠김</Badge>;
    }
    if (module.progress?.status === 'completed') {
      return <Badge className="bg-green-500">완료</Badge>;
    }
    if (module.progress?.status === 'in_progress') {
      return <Badge className="bg-blue-500">진행 중</Badge>;
    }
    return <Badge variant="outline">시작 가능</Badge>;
  };

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">학습 모듈</h1>
        <p className="text-muted-foreground mt-1">
          5개의 모듈을 순서대로 학습하며 프롬프트 엔지니어링 역량을 키워보세요
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="모듈 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filteredModules.map((module) => (
          <Card
            key={module.id}
            className={!module.isUnlocked ? 'opacity-60' : ''}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(module)}</div>
                  <div>
                    <CardTitle className="text-xl">
                      Module {module.orderIndex}: {module.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(module)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">학습 목표</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {module.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {module.techniques.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    예상 소요 시간: {module.estimatedMinutes}분
                    {module.progress && module.progress.status !== 'not_started' && (
                      <span className="ml-4">
                        진행률: {module.progress.stepsCompleted}/{module.progress.totalSteps} 단계
                      </span>
                    )}
                  </div>
                  <Button
                    disabled={!module.isUnlocked}
                    asChild={module.isUnlocked}
                  >
                    {module.isUnlocked ? (
                      <Link href={ROUTES.MODULE(module.id)}>
                        {module.progress?.status === 'completed'
                          ? '다시 학습하기'
                          : module.progress?.status === 'in_progress'
                          ? '이어서 학습하기'
                          : '학습 시작하기'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    ) : (
                      <span>
                        <Lock className="mr-2 h-4 w-4" />
                        이전 모듈 완료 필요
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
