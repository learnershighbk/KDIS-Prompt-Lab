'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Lightbulb,
  ArrowRight,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { useSocraticChat } from '@/features/ai/hooks/useAI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type SocraticDialoguePageProps = {
  params: Promise<{ moduleId: string }>;
};

const initialQuestions: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111':
    '안녕하세요! 👋 오늘은 "좋은 질문이 좋은 답을 만든다"에 대해 함께 탐구해볼 거예요.\n\n시작하기 전에 한 가지 질문을 드릴게요: AI에게 질문할 때, 왜 구체적인 질문이 중요하다고 생각하시나요?\n\n편하게 생각나는 대로 답해주세요. 정답은 없어요! 🙂',
  '22222222-2222-2222-2222-222222222222':
    '안녕하세요! 👋 오늘은 AI를 활용한 문헌 리뷰에 대해 이야기해볼게요.\n\n먼저 질문 하나: 문헌을 읽고 요약할 때, AI에게 어떤 식으로 도움을 요청하면 좋을까요?\n\n혹시 이미 시도해보신 경험이 있다면 그것도 좋아요!',
  '33333333-3333-3333-3333-333333333333':
    '안녕하세요! 👋 오늘의 주제는 정책 비교 분석이에요.\n\n바로 질문 드릴게요: 두 나라의 정책을 비교한다면, 어떤 기준으로 비교하는 것이 공정할까요?\n\n예를 들어, 한국과 일본의 출산 정책을 비교한다고 생각해보세요.',
  '44444444-4444-4444-4444-444444444444':
    '안녕하세요! 👋 오늘은 데이터 해석에 대해 함께 탐구해볼 거예요.\n\n질문 드릴게요: 데이터를 보고 분석할 때, AI의 도움이 가장 필요한 부분은 어디라고 생각하시나요?\n\n개인적인 경험이나 생각을 자유롭게 말씀해주세요.',
  '55555555-5555-5555-5555-555555555555':
    '안녕하세요! 👋 오늘은 정책 문서 작성에 대해 이야기해볼게요.\n\n먼저 한 가지 질문: 정책 문서를 작성할 때 가장 어려운 부분은 무엇인가요?\n\n구조 잡기, 논리 전개, 문장 다듬기... 어떤 것이든 좋아요.',
};

const hints: Record<string, string[]> = {
  '11111111-1111-1111-1111-111111111111': [
    '모호한 질문 vs 구체적인 질문의 차이를 생각해보세요',
    'AI가 맥락을 이해하려면 어떤 정보가 필요할까요?',
    '좋은 질문의 구성 요소를 떠올려보세요',
  ],
  '22222222-2222-2222-2222-222222222222': [
    '문헌의 핵심 논점을 파악하는 방법을 생각해보세요',
    '여러 문헌을 비교할 때 어떤 기준이 필요할까요?',
    '문헌의 신뢰성을 평가하는 방법을 고려해보세요',
  ],
  '33333333-3333-3333-3333-333333333333': [
    '정책의 효과성을 측정하는 지표를 생각해보세요',
    '다양한 이해관계자의 관점을 고려해보세요',
    '정책의 장단점을 체계적으로 분석하는 방법을 떠올려보세요',
  ],
  '44444444-4444-4444-4444-444444444444': [
    '데이터의 패턴과 트렌드를 찾는 방법을 생각해보세요',
    '통계적 의미와 실질적 의미의 차이를 고려해보세요',
    '데이터 시각화의 중요성을 떠올려보세요',
  ],
  '55555555-5555-5555-5555-555555555555': [
    '정책 문서의 구조와 논리적 흐름을 생각해보세요',
    '대상 독자를 고려한 글쓰기 방법을 떠올려보세요',
    '설득력 있는 주장을 펼치는 방법을 고려해보세요',
  ],
};

const MAX_EXCHANGES = 5;

export default function SocraticDialoguePage({ params }: SocraticDialoguePageProps) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending: isLoading } = useSocraticChat();

  const exchangeCount = Math.floor(messages.filter((m) => m.role === 'user').length);
  const progressPercent = Math.min((exchangeCount / MAX_EXCHANGES) * 100, 100);

  useEffect(() => {
    const initialQuestion = initialQuestions[moduleId] || initialQuestions['11111111-1111-1111-1111-111111111111'];
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: initialQuestion,
        timestamp: new Date(),
      },
    ]);
  }, [moduleId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    const conversationHistory = updatedMessages
      .filter((m) => m.id !== '1')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    sendMessage(
      {
        moduleId,
        userMessage: input.trim(),
        conversationHistory,
      },
      {
        onSuccess: (data) => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          if (data.canProceed) {
            setCanProceed(true);
          }
        },
        onError: (error) => {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `죄송합니다, 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.\n\n(오류: ${error.message})`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  }, [input, isLoading, messages, moduleId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    const moduleHints = hints[moduleId] || hints['11111111-1111-1111-1111-111111111111'];
    setCurrentHintIndex((prev) => (prev + 1) % moduleHints.length);
  };

  const handleComplete = () => {
    router.push(`${ROUTES.MODULE(moduleId)}/prompt_writing`);
  };

  const currentHints = hints[moduleId] || hints['11111111-1111-1111-1111-111111111111'];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.MODULE(moduleId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              모듈로 돌아가기
            </Link>
          </Button>
          <Badge variant="outline">Step 1: 소크라테스 대화</Badge>
        </div>
        <Button
          onClick={handleComplete}
          className={cn(
            'transition-all duration-300',
            canProceed && 'bg-green-600 hover:bg-green-700 animate-pulse'
          )}
        >
          {canProceed && <CheckCircle2 className="mr-2 h-4 w-4" />}
          다음 단계로
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI 튜터와의 대화</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{exchangeCount} / {MAX_EXCHANGES} 대화</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-1.5 mt-2" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      message.role === 'assistant'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-2',
                      message.role === 'assistant'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">생각하는 중...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {canProceed ? (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-800 dark:text-green-200">
                  🎉 소크라테스 대화를 완료했습니다!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  오른쪽 상단의 &apos;다음 단계로&apos; 버튼을 클릭하여 프롬프트 작성으로 이동하세요.
                </p>
                <Button onClick={handleComplete} className="mt-3 bg-green-600 hover:bg-green-700">
                  프롬프트 작성으로 이동
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="답변을 입력하세요..."
                  className="resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-auto"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              힌트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showHint ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {currentHints[currentHintIndex]}
                </p>
                <Button variant="outline" size="sm" onClick={handleShowHint}>
                  다른 힌트 보기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  답변이 어려우시다면 힌트를 확인해보세요.
                </p>
                <Button variant="outline" size="sm" onClick={handleShowHint}>
                  힌트 보기
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">💡 학습 진행 안내</h4>
              <p className="text-xs text-muted-foreground">
                AI 튜터와 {MAX_EXCHANGES}회 정도 대화하면 핵심 개념을 이해할 수 있어요.
                {exchangeCount >= 2 && !canProceed && (
                  <span className="block mt-2 text-primary">
                    충분히 대화했다면 &apos;다음 단계로&apos; 버튼을 눌러 진행할 수 있어요!
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
