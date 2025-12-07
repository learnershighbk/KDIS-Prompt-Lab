'use client';

import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useModules } from '@/features/modules/hooks/useModules';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

type ModulesPageProps = {
  params: Promise<Record<string, never>>;
};

const STEP_TOTAL = 4;

function getStepsCompletedFromPercentage(percentage: number): number {
  return Math.round((percentage / 100) * STEP_TOTAL);
}

export default function ModulesPage({ params }: ModulesPageProps) {
  void params;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useModules();

  const modules = data?.modules ?? [];

  const getStatusIcon = (module: typeof modules[0]) => {
    if (module.isLocked) {
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

  const getStatusBadge = (module: typeof modules[0]) => {
    if (module.isLocked) {
      return <Badge variant="secondary">{t('modules.locked')}</Badge>;
    }
    if (module.progress?.status === 'completed') {
      return <Badge className="bg-green-500">{t('modules.completed')}</Badge>;
    }
    if (module.progress?.status === 'in_progress') {
      return <Badge className="bg-blue-500">{t('modules.inProgress')}</Badge>;
    }
    return <Badge variant="outline">{t('modules.available')}</Badge>;
  };

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (module.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

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
        <p className="text-destructive">{t('modules.errorLoading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('modules.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('modules.description', { count: modules.length })}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('modules.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filteredModules.map((module) => {
          const stepsCompleted = module.progress
            ? getStepsCompletedFromPercentage(module.progress.percentage)
            : 0;

          return (
            <Card
              key={module.id}
              className={module.isLocked ? 'opacity-60' : ''}
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
                  <div className="flex flex-wrap gap-2">
                    {module.techniques.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {module.progress && module.progress.status !== 'not_started' && (
                        <span>
                          {t('modules.progress', {
                            completed: stepsCompleted,
                            total: STEP_TOTAL,
                          })}
                        </span>
                      )}
                    </div>
                    <Button
                      disabled={module.isLocked}
                      asChild={!module.isLocked}
                    >
                      {!module.isLocked ? (
                        <Link href={ROUTES.MODULE(module.id)}>
                          {module.progress?.status === 'completed'
                            ? t('modules.reviewAgain')
                            : module.progress?.status === 'in_progress'
                            ? t('modules.continueLearning')
                            : t('modules.startLearning')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ) : (
                        <span>
                          <Lock className="mr-2 h-4 w-4" />
                          {t('modules.previousModuleRequired')}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
