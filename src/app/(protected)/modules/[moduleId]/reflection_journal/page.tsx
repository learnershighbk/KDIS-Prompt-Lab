'use client';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Save,
  Trophy,
  Star,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';

type ReflectionJournalPageProps = {
  params: Promise<{ moduleId: string }>;
};

interface ReflectionQuestion {
  id: string;
  question: string;
  placeholder: string;
}

const reflectionQuestions: ReflectionQuestion[] = [
  {
    id: 'learned',
    question: '이 모듈에서 가장 인상 깊었던 내용은 무엇인가요?',
    placeholder: '학습하면서 새롭게 알게 된 점이나 특히 기억에 남는 내용을 적어주세요...',
  },
  {
    id: 'applied',
    question: '배운 내용을 실제 업무에 어떻게 적용할 수 있을까요?',
    placeholder: '구체적인 상황이나 업무에 적용할 수 있는 방법을 생각해보세요...',
  },
  {
    id: 'challenges',
    question: '학습 과정에서 어려웠던 점은 무엇인가요?',
    placeholder: '어려웠던 부분과 그것을 어떻게 해결했는지 적어주세요...',
  },
  {
    id: 'improvement',
    question: '앞으로 더 발전시키고 싶은 부분은 무엇인가요?',
    placeholder: '추가로 학습하거나 연습하고 싶은 내용을 적어주세요...',
  },
];

const moduleInfo: Record<string, { title: string; techniques: string[] }> = {
  '11111111-1111-1111-1111-111111111111': {
    title: '좋은 질문이 좋은 답을 만든다',
    techniques: ['명확성', '구체성', '맥락 제공'],
  },
  '22222222-2222-2222-2222-222222222222': {
    title: '문헌 리뷰 효과적으로 하기',
    techniques: ['요약', '분석', '비교'],
  },
  '33333333-3333-3333-3333-333333333333': {
    title: '정책 비교 분석 요청하기',
    techniques: ['비교 분석', '기준 설정', '체계적 평가'],
  },
  '44444444-4444-4444-4444-444444444444': {
    title: '데이터 해석 도움받기',
    techniques: ['데이터 설명', '해석 요청', '인사이트 도출'],
  },
  '55555555-5555-5555-5555-555555555555': {
    title: '정책 문서 작성 지원받기',
    techniques: ['구조화', '초안 작성', '수정 요청'],
  },
};

export default function ReflectionJournalPage({ params }: ReflectionJournalPageProps) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const info = moduleInfo[moduleId] || moduleInfo['11111111-1111-1111-1111-111111111111'];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isFormValid = reflectionQuestions.every(
    (q) => answers[q.id]?.trim().length >= 10
  );

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;

    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setIsCompleted(true);
    }, 1500);
  };

  const handleFinish = () => {
    router.push(ROUTES.MODULES);
  };

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">모듈 완료!</h2>
              <p className="text-muted-foreground">
                {info.title} 모듈을 성공적으로 완료했습니다.
              </p>
            </div>

            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-3 flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                획득한 기술 배지
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {info.techniques.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-sm py-1 px-3">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleFinish} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                모듈 목록으로 돌아가기
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={ROUTES.MYPAGE.JOURNALS}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  내 성찰 저널 보기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.MODULE(moduleId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              모듈로 돌아가기
            </Link>
          </Button>
          <Badge variant="outline">Step 4: 성찰 저널</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            학습 성찰 저널
          </CardTitle>
          <CardDescription>
            이 모듈에서 배운 내용을 정리하고 성찰해보세요. 모든 질문에 답변하면 모듈이 완료됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">{info.title}</h3>
            <p className="text-sm text-muted-foreground">
              이 모듈에서 학습한 핵심 기술: {info.techniques.join(', ')}
            </p>
          </div>

          <div className="space-y-6">
            {reflectionQuestions.map((q, index) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={q.id} className="text-base">
                  {index + 1}. {q.question}
                </Label>
                <Textarea
                  id={q.id}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {(answers[q.id]?.length || 0) < 10
                    ? `최소 10자 이상 작성해주세요 (현재 ${answers[q.id]?.length || 0}자)`
                    : <span className="text-green-600">작성 완료</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                  저장 중...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  저널 저장 및 모듈 완료
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
