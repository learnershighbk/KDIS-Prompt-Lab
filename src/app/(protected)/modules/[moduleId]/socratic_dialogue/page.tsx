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
import { useTranslation } from '@/features/i18n/hooks/useTranslation';
import { useLocaleStore } from '@/features/i18n/stores/locale.store';
import koTranslations from '@/features/i18n/locales/ko.json';
import enTranslations from '@/features/i18n/locales/en.json';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type SocraticDialoguePageProps = {
  params: Promise<{ moduleId: string }>;
};

const MODULE_ID_MAP: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111': 'module1',
  '22222222-2222-2222-2222-222222222222': 'module2',
  '33333333-3333-3333-3333-333333333333': 'module3',
  '44444444-4444-4444-4444-444444444444': 'module4',
  '55555555-5555-5555-5555-555555555555': 'module5',
};

const MAX_EXCHANGES = 5;

export default function SocraticDialoguePage({ params }: SocraticDialoguePageProps) {
  const { moduleId } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useLocaleStore((state) => state.locale);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending: isLoading } = useSocraticChat();

  const exchangeCount = Math.floor(messages.filter((m) => m.role === 'user').length);
  const progressPercent = Math.min((exchangeCount / MAX_EXCHANGES) * 100, 100);

  const moduleKey = MODULE_ID_MAP[moduleId] || 'module1';
  
  const translations = locale === 'ko' ? koTranslations : enTranslations;
  const initialQuestion = (translations.socratic.initialQuestions as any)[moduleKey] || '';
  const currentHints = ((translations.socratic.hints as any)[moduleKey] as string[]) || [];

  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: initialQuestion,
        timestamp: new Date(),
      },
    ]);
  }, [moduleId, initialQuestion]);

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
            content: `${t('socratic.errorMessage')}\n\n(${t('socratic.error')}: ${error.message})`,
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
    setCurrentHintIndex((prev) => (prev + 1) % currentHints.length);
  };

  const handleComplete = () => {
    router.push(`${ROUTES.MODULE(moduleId)}/prompt_writing`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.MODULE(moduleId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('socratic.backToModule')}
            </Link>
          </Button>
          <Badge variant="outline">{t('socratic.step1')}</Badge>
        </div>
        <Button
          onClick={handleComplete}
          className={cn(
            'transition-all duration-300',
            canProceed && 'bg-green-600 hover:bg-green-700 animate-pulse'
          )}
        >
          {canProceed && <CheckCircle2 className="mr-2 h-4 w-4" />}
          {t('socratic.nextStep')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t('socratic.chatTitle')}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{exchangeCount} / {MAX_EXCHANGES} {t('socratic.exchanges')}</span>
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
                      <span className="text-sm text-muted-foreground">{t('socratic.thinking')}</span>
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
                  🎉 {t('socratic.complete')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {t('socratic.completeMessage')}
                </p>
                <Button onClick={handleComplete} className="mt-3 bg-green-600 hover:bg-green-700">
                  {t('socratic.goToPromptWriting')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('socratic.answerPlaceholder')}
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
              {t('socratic.hint')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showHint ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {currentHints[currentHintIndex]}
                </p>
                <Button variant="outline" size="sm" onClick={handleShowHint}>
                  {t('socratic.anotherHint')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('socratic.hintDescription')}
                </p>
                <Button variant="outline" size="sm" onClick={handleShowHint}>
                  {t('socratic.showHint')}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">💡 {t('socratic.learningGuide')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('socratic.learningDescription', { count: MAX_EXCHANGES })}
                {exchangeCount >= 2 && !canProceed && (
                  <span className="block mt-2 text-primary">
                    {t('socratic.canProceed')}
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
