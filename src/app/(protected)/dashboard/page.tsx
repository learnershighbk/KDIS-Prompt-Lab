'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ROUTES } from '@/constants/routes';

interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: string | null;
  stepsCompleted: number;
  totalSteps: number;
}

interface ProgressData {
  overall: {
    completedModules: number;
    totalModules: number;
    percentage: number;
  };
  modules: ModuleProgress[];
  badges: Array<{
    technique: string;
    moduleTitle: string;
    earnedAt: string;
  }>;
}

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProgressData({
      overall: {
        completedModules: 0,
        totalModules: 5,
        percentage: 0,
      },
      modules: [
        {
          moduleId: '11111111-1111-1111-1111-111111111111',
          moduleTitle: '좋은 질문이 좋은 답을 만든다',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '22222222-2222-2222-2222-222222222222',
          moduleTitle: '문헌 리뷰 효과적으로 하기',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '33333333-3333-3333-3333-333333333333',
          moduleTitle: '정책 비교 분석 요청하기',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '44444444-4444-4444-4444-444444444444',
          moduleTitle: '데이터 해석 도움받기',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '55555555-5555-5555-5555-555555555555',
          moduleTitle: '정책 문서 작성 지원받기',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
      ],
      badges: [],
    });
    setIsLoading(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNextModule = () => {
    if (!progressData) return null;
    const inProgress = progressData.modules.find((m) => m.status === 'in_progress');
    if (inProgress) return inProgress;
    const notStarted = progressData.modules.find((m) => m.status === 'not_started');
    return notStarted;
  };

  const nextModule = getNextModule();

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
        <h1 className="text-3xl font-bold">
          안녕하세요, {user?.userMetadata?.full_name ?? '학습자'}님!
        </h1>
        <p className="text-muted-foreground mt-1">
          오늘도 프롬프트 엔지니어링 역량을 키워보세요.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 진도</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.overall.percentage ?? 0}%</div>
            <p className="text-xs text-muted-foreground">
              {progressData?.overall.completedModules ?? 0} / {progressData?.overall.totalModules ?? 5} 모듈 완료
            </p>
            <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressData?.overall.percentage ?? 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">획득한 배지</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.badges.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              프롬프트 테크닉 배지
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {progressData?.badges.slice(0, 3).map((badge) => (
                <Badge key={badge.technique} variant="secondary" className="text-xs">
                  {badge.technique}
                </Badge>
              ))}
              {(progressData?.badges.length ?? 0) === 0 && (
                <span className="text-xs text-muted-foreground">아직 획득한 배지가 없습니다</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">다음 학습</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextModule ? (
              <>
                <div className="text-lg font-semibold">{nextModule.moduleTitle}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextModule.status === 'in_progress'
                    ? `진행 중 (${nextModule.stepsCompleted}/${nextModule.totalSteps} 단계)`
                    : '시작하기'}
                </p>
                <Button className="mt-3 w-full" asChild>
                  <Link href={ROUTES.MODULE(nextModule.moduleId)}>
                    {nextModule.status === 'in_progress' ? '이어서 학습하기' : '학습 시작하기'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">모든 모듈을 완료했습니다!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학습 모듈</CardTitle>
          <CardDescription>
            5개의 모듈을 순서대로 학습하며 프롬프트 엔지니어링 역량을 키워보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData?.modules.map((module, index) => (
              <div
                key={module.moduleId}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(module.status)}
                  </div>
                  <div>
                    <div className="font-medium">
                      Module {index + 1}: {module.moduleTitle}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.status === 'completed'
                        ? '완료'
                        : module.status === 'in_progress'
                        ? `진행 중 (${module.stepsCompleted}/${module.totalSteps} 단계)`
                        : index === 0
                        ? '시작 가능'
                        : '잠김'}
                    </div>
                  </div>
                </div>
                <Button
                  variant={module.status === 'not_started' && index > 0 ? 'outline' : 'default'}
                  size="sm"
                  disabled={module.status === 'not_started' && index > 0}
                  asChild={!(module.status === 'not_started' && index > 0)}
                >
                  {module.status === 'not_started' && index > 0 ? (
                    <span>
                      <Lock className="h-4 w-4" />
                    </span>
                  ) : (
                    <Link href={ROUTES.MODULE(module.moduleId)}>
                      {module.status === 'completed'
                        ? '다시 학습'
                        : module.status === 'in_progress'
                        ? '이어서'
                        : '시작'}
                    </Link>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
