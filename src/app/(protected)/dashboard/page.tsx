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
import { useTranslation } from '@/features/i18n/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';

interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  moduleTitleEn: string | null;
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
  const { t, locale } = useTranslation();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getModuleTitle = (module: ModuleProgress) => {
    return locale === 'en' && module.moduleTitleEn ? module.moduleTitleEn : module.moduleTitle;
  };

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
          moduleTitleEn: 'Good Questions Lead to Good Answers',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '22222222-2222-2222-2222-222222222222',
          moduleTitle: '문헌 리뷰 효과적으로 하기',
          moduleTitleEn: 'Effective Literature Review',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '33333333-3333-3333-3333-333333333333',
          moduleTitle: '정책 비교 분석 요청하기',
          moduleTitleEn: 'Requesting Policy Comparison Analysis',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '44444444-4444-4444-4444-444444444444',
          moduleTitle: '데이터 해석 도움받기',
          moduleTitleEn: 'Getting Help with Data Interpretation',
          status: 'not_started',
          currentStep: null,
          stepsCompleted: 0,
          totalSteps: 4,
        },
        {
          moduleId: '55555555-5555-5555-5555-555555555555',
          moduleTitle: '정책 문서 작성 지원받기',
          moduleTitleEn: 'Getting Support for Policy Document Writing',
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
          {user?.userMetadata?.full_name
            ? t('dashboard.greeting', { name: user.userMetadata.full_name })
            : t('dashboard.greetingDefault')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.overallProgress')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.overall.percentage ?? 0}%</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.modulesCompleted', {
                completed: progressData?.overall.completedModules ?? 0,
                total: progressData?.overall.totalModules ?? 5,
              })}
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
            <CardTitle className="text-sm font-medium">{t('dashboard.earnedBadges')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.badges.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.promptTechniqueBadges')}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {progressData?.badges.slice(0, 3).map((badge) => (
                <Badge key={badge.technique} variant="secondary" className="text-xs">
                  {badge.technique}
                </Badge>
              ))}
              {(progressData?.badges.length ?? 0) === 0 && (
                <span className="text-xs text-muted-foreground">{t('dashboard.noBadgesYet')}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.nextLearning')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextModule ? (
              <>
                <div className="text-lg font-semibold">{getModuleTitle(nextModule)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextModule.status === 'in_progress'
                    ? t('dashboard.inProgress', {
                        completed: nextModule.stepsCompleted,
                        total: nextModule.totalSteps,
                      })
                    : t('dashboard.start')}
                </p>
                <Button className="mt-3 w-full" asChild>
                  <Link href={ROUTES.MODULE(nextModule.moduleId)}>
                    {nextModule.status === 'in_progress'
                      ? t('dashboard.continueLearning')
                      : t('dashboard.startLearning')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{t('dashboard.allModulesCompleted')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.learningModules')}</CardTitle>
          <CardDescription>
            {t('dashboard.learningModulesDescription', { count: 5 })}
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
                      Module {index + 1}: {getModuleTitle(module)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.status === 'completed'
                        ? t('dashboard.completed')
                        : module.status === 'in_progress'
                        ? t('dashboard.inProgress', {
                            completed: module.stepsCompleted,
                            total: module.totalSteps,
                          })
                        : index === 0
                        ? t('dashboard.available')
                        : t('dashboard.locked')}
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
                        ? t('dashboard.review')
                        : module.status === 'in_progress'
                        ? t('dashboard.continue')
                        : t('dashboard.start')}
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
