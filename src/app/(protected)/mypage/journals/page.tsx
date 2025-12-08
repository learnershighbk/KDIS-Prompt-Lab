'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

type JournalsPageProps = {
  params: Promise<Record<string, never>>;
};

interface JournalEntry {
  id: string;
  moduleId: string;
  moduleTitle: string;
  createdAt: string;
  answers: {
    learned: string;
    applied: string;
    challenges: string;
    improvement: string;
  };
}

const mockJournals: JournalEntry[] = [
  {
    id: '1',
    moduleId: '11111111-1111-1111-1111-111111111111',
    moduleTitle: '좋은 질문이 좋은 답을 만든다',
    createdAt: '2024-01-15T14:30:00Z',
    answers: {
      learned:
        '구체적인 맥락과 역할을 제시하면 AI가 훨씬 더 정확하고 유용한 답변을 제공한다는 것을 배웠습니다. 특히 "정책 분석가로서" 같은 역할 지정이 답변의 질을 크게 높인다는 점이 인상적이었습니다.',
      applied:
        '앞으로 정책 보고서 초안 작성 시 AI에게 구체적인 역할, 대상 독자, 원하는 형식을 명시하여 요청할 계획입니다. 예를 들어 "환경부 정책 담당자로서, 국회의원을 대상으로 한 2페이지 분량의 정책 브리프를 작성해줘" 와 같이 요청하겠습니다.',
      challenges:
        '처음에는 어느 정도의 맥락을 제공해야 하는지 감이 잡히지 않았습니다. 너무 많은 정보를 제공하면 AI가 혼란스러워할까 걱정되기도 했습니다. 하지만 실습을 통해 구체적일수록 좋다는 것을 알게 되었습니다.',
      improvement:
        'Chain of Thought 프롬프팅과 Few-shot Learning 기법을 더 연습하고 싶습니다. 특히 복잡한 분석 작업에서 단계적 사고를 유도하는 방법을 익히면 업무에 큰 도움이 될 것 같습니다.',
    },
  },
];

export default function JournalsPage({ params }: JournalsPageProps) {
  void params;
  const { t } = useTranslation();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setJournals(mockJournals);
    setIsLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = t.locale === 'ko' ? 'ko-KR' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
        <h1 className="text-3xl font-bold">{t('journals.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('journals.description')}
        </p>
      </div>

      {journals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookMarked className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">{t('journals.noJournalsYet')}</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {t('journals.completeModuleToWrite')}
            </p>
            <Button asChild>
              <Link href={ROUTES.MODULES}>{t('journals.startLearning')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => (
            <Card key={journal.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleExpand(journal.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookMarked className="h-6 w-6" />
                      {journal.moduleTitle}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(journal.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t('journals.completed')}</Badge>
                    {expandedId === journal.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedId === journal.id && (
                <CardContent className="space-y-6 pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-base text-muted-foreground mb-2">
                        {t('journals.mostImpressive')}
                      </h4>
                      <p className="text-base bg-muted p-3 rounded-lg">
                        {journal.answers.learned}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-base text-muted-foreground mb-2">
                        {t('journals.practicalApplication')}
                      </h4>
                      <p className="text-base bg-muted p-3 rounded-lg">
                        {journal.answers.applied}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-base text-muted-foreground mb-2">
                        {t('journals.learningChallenges')}
                      </h4>
                      <p className="text-base bg-muted p-3 rounded-lg">
                        {journal.answers.challenges}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-base text-muted-foreground mb-2">
                        {t('journals.areasForImprovement')}
                      </h4>
                      <p className="text-base bg-muted p-3 rounded-lg">
                        {journal.answers.improvement}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.MODULE(journal.moduleId)}>
                        {t('journals.reviewModule')}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
