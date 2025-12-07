'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type ProgressPageProps = {
  params: Promise<Record<string, never>>;
};

interface ModuleProgress {
  moduleId: string;
  title: string;
  orderIndex: number;
  status: 'not_started' | 'in_progress' | 'completed';
  stepsCompleted: number;
  totalSteps: number;
  completedAt?: string;
}

interface OverallStats {
  totalModules: number;
  completedModules: number;
  totalSteps: number;
  completedSteps: number;
  totalBadges: number;
  learningStreak: number;
}

const mockModules: ModuleProgress[] = [
  {
    moduleId: '11111111-1111-1111-1111-111111111111',
    title: '좋은 질문이 좋은 답을 만든다',
    orderIndex: 1,
    status: 'completed',
    stepsCompleted: 4,
    totalSteps: 4,
    completedAt: '2024-01-15',
  },
  {
    moduleId: '22222222-2222-2222-2222-222222222222',
    title: '문헌 리뷰 효과적으로 하기',
    orderIndex: 2,
    status: 'in_progress',
    stepsCompleted: 2,
    totalSteps: 4,
  },
  {
    moduleId: '33333333-3333-3333-3333-333333333333',
    title: '정책 비교 분석 요청하기',
    orderIndex: 3,
    status: 'not_started',
    stepsCompleted: 0,
    totalSteps: 4,
  },
  {
    moduleId: '44444444-4444-4444-4444-444444444444',
    title: '데이터 해석 도움받기',
    orderIndex: 4,
    status: 'not_started',
    stepsCompleted: 0,
    totalSteps: 4,
  },
  {
    moduleId: '55555555-5555-5555-5555-555555555555',
    title: '정책 문서 작성 지원받기',
    orderIndex: 5,
    status: 'not_started',
    stepsCompleted: 0,
    totalSteps: 4,
  },
];

export default function ProgressPage({ params }: ProgressPageProps) {
  void params;
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setModules(mockModules);
    setStats({
      totalModules: 5,
      completedModules: 1,
      totalSteps: 20,
      completedSteps: 6,
      totalBadges: 3,
      learningStreak: 5,
    });
    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: ModuleProgress['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">완료</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">진행 중</Badge>;
      default:
        return <Badge variant="secondary">시작 전</Badge>;
    }
  };

  const overallPercentage = stats
    ? Math.round((stats.completedSteps / stats.totalSteps) * 100)
    : 0;

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
        <h1 className="text-3xl font-bold">학습 진도</h1>
        <p className="text-muted-foreground mt-1">
          전체 학습 현황과 모듈별 진행 상태를 확인하세요
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 진도</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <Progress value={overallPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.completedSteps}/{stats?.totalSteps} 단계 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료한 모듈</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completedModules}/{stats?.totalModules}
            </div>
            <p className="text-xs text-muted-foreground mt-2">모듈 완료</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">획득 배지</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBadges}</div>
            <p className="text-xs text-muted-foreground mt-2">기술 배지 획득</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연속 학습</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.learningStreak}일</div>
            <p className="text-xs text-muted-foreground mt-2">연속 학습 기록</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            모듈별 진행 현황
          </CardTitle>
          <CardDescription>
            각 모듈의 학습 진행 상태와 완료율을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {modules.map((module) => {
              const percentage = Math.round(
                (module.stepsCompleted / module.totalSteps) * 100
              );
              return (
                <div key={module.moduleId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        M{module.orderIndex}
                      </span>
                      <span className="font-medium">{module.title}</span>
                      {getStatusBadge(module.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {module.stepsCompleted}/{module.totalSteps} 단계
                      </span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  {module.completedAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      완료일: {module.completedAt}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
