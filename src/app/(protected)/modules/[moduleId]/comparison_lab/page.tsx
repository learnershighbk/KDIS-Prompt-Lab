'use client';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  GitCompare,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type ComparisonLabPageProps = {
  params: Promise<{ moduleId: string }>;
};

interface ComparisonResult {
  promptA: string;
  promptB: string;
  responseA: string;
  responseB: string;
  analysis: string;
}

const samplePrompts: Record<string, { promptA: string; promptB: string }> = {
  '11111111-1111-1111-1111-111111111111': {
    promptA: '대학 입시 정책에 대해 알려줘',
    promptB:
      '한국 교육부 정책 분석가로서, 현행 대학 입시 제도(수능, 수시, 정시)의 장단점을 분석하고, OECD 주요국의 입시 제도와 비교하여 개선 방안을 3가지 제시해주세요. 각 방안에 대해 예상되는 효과와 제약 사항도 함께 설명해주세요.',
  },
  '22222222-2222-2222-2222-222222222222': {
    promptA: '기후변화 정책 논문 요약해줘',
    promptB:
      '환경 정책 연구원으로서, 2020년 이후 발표된 주요 기후변화 대응 정책 논문 5편을 선정하여 각 논문의 핵심 주장, 연구 방법론, 주요 발견을 표 형식으로 정리해주세요. 또한 논문들 간의 공통점과 차이점을 분석해주세요.',
  },
  '33333333-3333-3333-3333-333333333333': {
    promptA: '북유럽 복지 정책 비교해줘',
    promptB:
      '복지부 정책 기획관으로서, 스웨덴, 덴마크, 노르웨이의 복지 정책을 다음 기준으로 비교 분석해주세요: 1) 의료보험 체계, 2) 연금 제도, 3) 육아 지원, 4) 실업 급여. 각 국가별 GDP 대비 복지 지출 비율과 함께 한국에 적용 가능한 시사점을 도출해주세요.',
  },
  '44444444-4444-4444-4444-444444444444': {
    promptA: 'GDP 데이터 분석해줘',
    promptB:
      '경제 분석가로서, 한국의 2019-2023년 분기별 GDP 성장률 데이터를 분석해주세요. 특히 1) 코로나19 전후 비교, 2) 산업별 기여도 변화, 3) 주요 선진국과의 비교를 포함하여 분석하고, 2024년 경제 전망에 대한 시사점을 그래프로 시각화할 수 있는 방법도 제안해주세요.',
  },
  '55555555-5555-5555-5555-555555555555': {
    promptA: '디지털 전환 정책 브리프 써줘',
    promptB:
      '과학기술정보통신부 정책 담당자로서, 장관에게 보고할 2페이지 분량의 "공공부문 디지털 전환 가속화 정책 브리프"를 작성해주세요. 다음 구조를 따라주세요: 1) 핵심 요약 (3줄), 2) 현황 및 문제점, 3) 해외 사례 (미국, 에스토니아), 4) 정책 제언 3가지, 5) 기대 효과 및 소요 예산. 공식적이고 간결한 문체를 사용해주세요.',
  },
};

export default function ComparisonLabPage({ params }: ComparisonLabPageProps) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [promptA, setPromptA] = useState(samplePrompts[moduleId]?.promptA || samplePrompts['11111111-1111-1111-1111-111111111111'].promptA);
  const [promptB, setPromptB] = useState(samplePrompts[moduleId]?.promptB || samplePrompts['11111111-1111-1111-1111-111111111111'].promptB);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBetter, setSelectedBetter] = useState<'A' | 'B' | null>(null);

  const handleCompare = async () => {
    if (!promptA.trim() || !promptB.trim() || isLoading) return;

    setIsLoading(true);
    setSelectedBetter(null);

    setTimeout(() => {
      setResult({
        promptA,
        promptB,
        responseA: `프롬프트 A에 대한 AI 응답:

대학 입시 정책은 수능과 수시로 나뉩니다. 수능은 객관적인 평가 방식이고, 수시는 다양한 요소를 평가합니다.

(일반적이고 피상적인 답변 - 구체적인 맥락이나 분석 없음)`,
        responseB: `프롬프트 B에 대한 AI 응답:

**현행 대학 입시 제도 분석**

1. **수능 (대학수학능력시험)**
   - 장점: 객관적 평가, 전국 단위 비교 가능
   - 단점: 사교육 의존도 높음, 창의성 평가 한계

2. **수시 (학생부종합전형)**
   - 장점: 다면적 평가, 교과 외 역량 인정
   - 단점: 공정성 논란, 지역/학교 간 격차

**OECD 주요국 비교**
| 국가 | 입시 방식 | 특징 |
|------|-----------|------|
| 미국 | SAT/ACT + 종합평가 | 다양성 중시 |
| 독일 | Abitur | 고교 졸업시험 중심 |
| 일본 | 공통테스트 + 대학별 시험 | 이중 평가 체계 |

**개선 방안 제안**
[상세 내용 계속...]`,
        analysis: `**비교 분석 결과**

프롬프트 B가 더 효과적인 이유:

1. **역할 지정**: "정책 분석가"라는 역할을 명시하여 전문적 관점의 답변 유도
2. **구체적 범위**: 분석 대상(수능, 수시, 정시)을 명확히 지정
3. **비교 기준 제시**: OECD 국가와의 비교를 요청하여 맥락 있는 분석 가능
4. **출력 형식 지정**: "3가지 제안", "표 형식" 등 구체적 형식 요구
5. **추가 정보 요청**: 효과와 제약 사항까지 포함하도록 요청

핵심 교훈: 구체적인 맥락, 역할, 출력 형식을 지정할수록 더 유용한 답변을 얻을 수 있습니다.`,
      });
      setIsLoading(false);
    }, 2500);
  };

  const handleReset = () => {
    setPromptA(samplePrompts[moduleId]?.promptA || '');
    setPromptB(samplePrompts[moduleId]?.promptB || '');
    setResult(null);
    setSelectedBetter(null);
  };

  const handleComplete = () => {
    router.push(`${ROUTES.MODULE(moduleId)}/reflection_journal`);
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
          <Badge variant="outline">Step 3: 비교 실험실</Badge>
        </div>
        <Button onClick={handleComplete} disabled={!result}>
          다음 단계로
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            프롬프트 비교 실험
          </CardTitle>
          <CardDescription>
            두 가지 다른 프롬프트를 비교하고 어떤 프롬프트가 더 효과적인지 분석해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="promptA">프롬프트 A (기본형)</Label>
              <Textarea
                id="promptA"
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                placeholder="첫 번째 프롬프트를 입력하세요..."
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promptB">프롬프트 B (개선형)</Label>
              <Textarea
                id="promptB"
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                placeholder="두 번째 프롬프트를 입력하세요..."
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button
              onClick={handleCompare}
              disabled={!promptA.trim() || !promptB.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  비교 중...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  비교 실행
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className={cn(
                'transition-all',
                selectedBetter === 'A' && 'ring-2 ring-green-500'
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">응답 A</CardTitle>
                  <Button
                    variant={selectedBetter === 'A' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBetter('A')}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    더 좋음
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {result.responseA}
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                'transition-all',
                selectedBetter === 'B' && 'ring-2 ring-green-500'
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">응답 B</CardTitle>
                  <Button
                    variant={selectedBetter === 'B' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBetter('B')}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    더 좋음
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {result.responseB}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>분석 결과</CardTitle>
              <CardDescription>
                두 프롬프트의 차이점과 효과적인 프롬프트 작성법에 대한 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm">{result.analysis}</div>
            </CardContent>
          </Card>

          {selectedBetter && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="h-5 w-5" />
                  <span>
                    프롬프트 {selectedBetter}를 더 효과적이라고 선택하셨습니다.
                    {selectedBetter === 'B' && ' 구체적이고 맥락이 풍부한 프롬프트가 더 좋은 결과를 이끌어냅니다!'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
