'use client';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Bot,
  RefreshCw,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';

type PromptWritingPageProps = {
  params: Promise<{ moduleId: string }>;
};

interface Scenario {
  title: string;
  description: string;
  context: string;
  goal: string;
  tips: string[];
}

const scenarios: Record<string, Scenario> = {
  '11111111-1111-1111-1111-111111111111': {
    title: '교육 정책 분석',
    description: '한국의 대학 입시 정책에 대해 분석하는 프롬프트를 작성해보세요.',
    context:
      '당신은 교육부 정책 분석가입니다. 현행 대학 입시 제도의 문제점과 개선 방안에 대한 보고서를 작성해야 합니다.',
    goal: 'AI에게 대학 입시 제도의 장단점과 개선 방안을 체계적으로 분석해달라는 프롬프트를 작성하세요.',
    tips: [
      '역할을 명확히 지정하세요',
      '분석의 범위와 기준을 구체적으로 제시하세요',
      '원하는 출력 형식을 명시하세요',
    ],
  },
  '22222222-2222-2222-2222-222222222222': {
    title: '기후변화 정책 문헌 리뷰',
    description: '기후변화 대응 정책에 관한 문헌을 리뷰하는 프롬프트를 작성해보세요.',
    context:
      '당신은 환경부 연구원입니다. 주요국의 기후변화 대응 정책에 관한 학술 논문들을 검토해야 합니다.',
    goal: 'AI에게 기후변화 정책 관련 문헌을 효과적으로 요약하고 분석해달라는 프롬프트를 작성하세요.',
    tips: [
      '검토할 문헌의 범위를 명확히 하세요',
      '요약의 핵심 포인트를 지정하세요',
      '비교 분석의 기준을 제시하세요',
    ],
  },
  '33333333-3333-3333-3333-333333333333': {
    title: '복지 정책 비교',
    description: '북유럽 국가들의 복지 정책을 비교 분석하는 프롬프트를 작성해보세요.',
    context:
      '당신은 복지부 정책 기획관입니다. 북유럽 복지 모델을 벤치마킹하여 한국에 적용 가능한 방안을 검토해야 합니다.',
    goal: 'AI에게 스웨덴, 덴마크, 노르웨이의 복지 정책을 체계적으로 비교 분석해달라는 프롬프트를 작성하세요.',
    tips: [
      '비교 기준을 명확히 설정하세요',
      '각국의 특수성을 고려하도록 요청하세요',
      '한국 적용 가능성도 분석하도록 하세요',
    ],
  },
  '44444444-4444-4444-4444-444444444444': {
    title: '경제 데이터 해석',
    description: 'GDP 성장률 데이터를 해석하는 프롬프트를 작성해보세요.',
    context:
      '당신은 기획재정부 분석관입니다. 최근 5년간의 GDP 성장률 데이터를 분석하여 경제 전망을 보고해야 합니다.',
    goal: 'AI에게 GDP 데이터를 해석하고 주요 인사이트를 도출해달라는 프롬프트를 작성하세요.',
    tips: [
      '데이터의 맥락을 충분히 제공하세요',
      '분석의 초점을 명확히 하세요',
      '시각화 제안도 요청해보세요',
    ],
  },
  '55555555-5555-5555-5555-555555555555': {
    title: '정책 브리프 작성',
    description: '디지털 전환 정책에 관한 브리프를 작성하는 프롬프트를 만들어보세요.',
    context:
      '당신은 과학기술정보통신부 담당자입니다. 장관에게 보고할 디지털 전환 정책 브리프를 작성해야 합니다.',
    goal: 'AI에게 정책 브리프 초안을 작성해달라는 프롬프트를 작성하세요.',
    tips: [
      '문서의 목적과 대상을 명시하세요',
      '필수 포함 내용을 나열하세요',
      '톤과 형식을 지정하세요',
    ],
  },
};

export default function PromptWritingPage({ params }: PromptWritingPageProps) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const scenario = scenarios[moduleId] || scenarios['11111111-1111-1111-1111-111111111111'];

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setHasSubmitted(true);

    setTimeout(() => {
      const mockResponse = `귀하의 프롬프트에 대한 분석 결과입니다:

**강점:**
- 역할과 맥락이 명확하게 제시되어 있습니다.
- 구체적인 분석 요청이 포함되어 있습니다.

**개선 가능한 부분:**
- 출력 형식을 더 명확히 지정하면 좋겠습니다.
- 분석의 범위나 기준을 추가하면 더 체계적인 답변을 얻을 수 있습니다.

**모범 응답 예시:**
[프롬프트에 따른 상세 분석 내용이 여기에 표시됩니다. 실제 구현 시에는 AI API를 통해 생성된 응답이 표시됩니다.]

다음 단계인 비교 실험실에서 다양한 프롬프트의 효과를 직접 비교해보세요!`;

      setResponse(mockResponse);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setPrompt('');
    setResponse('');
    setHasSubmitted(false);
  };

  const handleComplete = () => {
    router.push(`${ROUTES.MODULE(moduleId)}/comparison_lab`);
  };

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
          <Badge variant="outline">Step 2: 프롬프트 작성</Badge>
        </div>
        <Button onClick={handleComplete} disabled={!hasSubmitted}>
          다음 단계로
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">상황</h4>
                <p className="text-sm text-muted-foreground">{scenario.context}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">목표</h4>
                <p className="text-sm text-muted-foreground">{scenario.goal}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">팁</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {scenario.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>프롬프트 작성</CardTitle>
              <CardDescription>
                위의 시나리오에 맞는 프롬프트를 작성해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="프롬프트를 입력하세요..."
                rows={8}
                className="resize-none"
              />
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    disabled={!prompt.trim()}
                  >
                    {isCopied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {isCopied ? '복사됨' : '복사'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    초기화
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitPrompt}
                  disabled={!prompt.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      제출하기
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI 응답
            </CardTitle>
            <CardDescription>
              프롬프트를 제출하면 AI의 응답이 여기에 표시됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">{response}</div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    프롬프트가 분석되었습니다. 다음 단계로 진행하세요.
                  </span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>프롬프트를 작성하고 제출해주세요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
