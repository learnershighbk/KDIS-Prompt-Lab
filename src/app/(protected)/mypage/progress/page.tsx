'use client';

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
import { useProgressOverview } from '@/features/progress/hooks/useProgress';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

type ProgressPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ProgressPage({ params }: ProgressPageProps) {
  void params;
  const { t, locale } = useTranslation();
  const { data, isLoading, error } = useProgressOverview();

  const getModuleTitle = (module: typeof modules[0]) => {
    return locale === 'en' && module.moduleTitleEn ? module.moduleTitleEn : module.moduleTitle;
  };

  const modules = data?.modules ?? [];
  const overall = data?.overall;
  const badges = data?.badges ?? [];

  const totalSteps = modules.reduce((acc, m) => acc + m.totalSteps, 0);
  const completedSteps = modules.reduce((acc, m) => acc + m.stepsCompleted, 0);
  const overallPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const getStatusBadge = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{t('progress.completed')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">{t('progress.inProgress')}</Badge>;
      default:
        return <Badge variant="secondary">{t('progress.notStarted')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{t('progress.errorLoading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('progress.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('progress.description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.overallProgress')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <Progress value={overallPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t('progress.stepsCompleted', { completed: completedSteps, total: totalSteps })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.completedModules')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overall?.completedModules ?? 0}/{overall?.totalModules ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('progress.modulesCompleted')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.earnedBadges')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
            <p className="text-xs text-muted-foreground mt-2">{t('progress.techniqueBadgesEarned')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.streak')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-2">{t('progress.learningStreak')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('progress.progressByModule')}
          </CardTitle>
          <CardDescription>
            {t('progress.progressByModuleDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {modules.map((module, index) => {
              const percentage = Math.round(
                (module.stepsCompleted / module.totalSteps) * 100
              );
              return (
                <div key={module.moduleId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        M{index + 1}
                      </span>
                      <span className="font-medium">{getModuleTitle(module)}</span>
                      {getStatusBadge(module.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {t('progress.steps', {
                          completed: module.stepsCompleted,
                          total: module.totalSteps,
                        })}
                      </span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  {module.completedAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('progress.completedDate', {
                        date: new Date(module.completedAt).toLocaleDateString('ko-KR'),
                      })}
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
