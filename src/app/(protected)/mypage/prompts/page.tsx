'use client';

import { useEffect, useState } from 'react';
import {
  History,
  Copy,
  Check,
  Calendar,
  Tag,
  Star,
  StarOff,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PromptsPageProps = {
  params: Promise<Record<string, never>>;
};

interface PromptHistory {
  id: string;
  prompt: string;
  moduleId: string;
  moduleTitle: string;
  stepType: string;
  createdAt: string;
  isFavorite: boolean;
  rating?: number;
}

const mockPrompts: PromptHistory[] = [
  {
    id: '1',
    prompt:
      '한국 교육부 정책 분석가로서, 현행 대학 입시 제도(수능, 수시, 정시)의 장단점을 분석하고, OECD 주요국의 입시 제도와 비교하여 개선 방안을 3가지 제시해주세요. 각 방안에 대해 예상되는 효과와 제약 사항도 함께 설명해주세요.',
    moduleId: '11111111-1111-1111-1111-111111111111',
    moduleTitle: '좋은 질문이 좋은 답을 만든다',
    stepType: 'prompt_writing',
    createdAt: '2024-01-15T14:00:00Z',
    isFavorite: true,
    rating: 5,
  },
  {
    id: '2',
    prompt:
      '환경 정책 연구원으로서, 2020년 이후 발표된 주요 기후변화 대응 정책 논문 5편을 선정하여 각 논문의 핵심 주장, 연구 방법론, 주요 발견을 표 형식으로 정리해주세요.',
    moduleId: '22222222-2222-2222-2222-222222222222',
    moduleTitle: '문헌 리뷰 효과적으로 하기',
    stepType: 'prompt_writing',
    createdAt: '2024-01-16T10:30:00Z',
    isFavorite: false,
    rating: 4,
  },
  {
    id: '3',
    prompt: '대학 입시 정책에 대해 알려줘',
    moduleId: '11111111-1111-1111-1111-111111111111',
    moduleTitle: '좋은 질문이 좋은 답을 만든다',
    stepType: 'comparison_lab',
    createdAt: '2024-01-15T14:30:00Z',
    isFavorite: false,
  },
];

export default function PromptsPage({ params }: PromptsPageProps) {
  void params;
  const [prompts, setPrompts] = useState<PromptHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setPrompts(mockPrompts);
    setIsLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStepTypeLabel = (stepType: string) => {
    const labels: Record<string, string> = {
      prompt_writing: '프롬프트 작성',
      comparison_lab: '비교 실험실',
      socratic_dialogue: '소크라테스 대화',
    };
    return labels[stepType] || stepType;
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || prompt.isFavorite;
    return matchesSearch && matchesFavorite;
  });

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
        <h1 className="text-3xl font-bold">프롬프트 히스토리</h1>
        <p className="text-muted-foreground mt-1">
          학습 과정에서 작성한 프롬프트를 확인하고 재사용하세요
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <History className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="프롬프트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star className="mr-2 h-4 w-4" />
          즐겨찾기만 보기
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        총 {filteredPrompts.length}개의 프롬프트
      </div>

      {filteredPrompts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">프롬프트 기록이 없습니다</h3>
            <p className="text-muted-foreground mt-1">
              {showFavoritesOnly
                ? '즐겨찾기한 프롬프트가 없습니다'
                : '모듈 학습을 진행하면 프롬프트가 기록됩니다'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{prompt.moduleTitle}</Badge>
                    <Badge variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {getStepTypeLabel(prompt.stepType)}
                    </Badge>
                    {prompt.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3 w-3',
                              i < prompt.rating!
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(prompt.id)}
                    >
                      {prompt.isFavorite ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(prompt.id, prompt.prompt)}
                    >
                      {copiedId === prompt.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg mb-3">
                  <p className="text-sm whitespace-pre-wrap">{prompt.prompt}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(prompt.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
