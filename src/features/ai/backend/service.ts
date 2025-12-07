import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SocraticRequest, PromptAnalysisRequest, ComparisonRequest } from './schema';
import { getSocraticSystemPrompt, getInitialQuestion } from './prompts/socratic-tutor';

export class AIService {
  private anthropic: Anthropic;

  constructor(
    private supabase: SupabaseClient,
    apiKey: string
  ) {
    this.anthropic = new Anthropic({
      apiKey,
    });
  }

  async generateSocraticResponse(data: SocraticRequest): Promise<{ message: string; canProceed: boolean }> {
    const systemPrompt = getSocraticSystemPrompt(data.moduleId);

    const conversationCount = Math.floor(data.conversationHistory.length / 2);
    const contextHint = conversationCount >= 3
      ? '\n\n[시스템 알림: 대화가 충분히 진행되었습니다. 학생이 핵심 개념을 이해했다면 이번 응답에서 마무리하세요.]'
      : '';

    const messages: Anthropic.MessageParam[] = data.conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: data.userMessage + contextHint,
    });

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const rawText = textContent?.type === 'text' ? textContent.text : '응답을 생성하지 못했습니다.';

    const canProceed = rawText.includes('[READY_FOR_NEXT_STEP]');
    const message = rawText.replace('[READY_FOR_NEXT_STEP]', '').trim();

    return { message, canProceed };
  }

  async *streamSocraticResponse(data: SocraticRequest): AsyncGenerator<string> {
    const systemPrompt = getSocraticSystemPrompt(data.moduleId);

    const messages: Anthropic.MessageParam[] = data.conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: data.userMessage,
    });

    const stream = await this.anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }

  getInitialMessage(moduleId: string): string {
    return getInitialQuestion(moduleId);
  }

  async analyzePrompt(data: PromptAnalysisRequest): Promise<{
    strengths: string[];
    improvements: string[];
    score: number;
    feedback: string;
  }> {
    const systemPrompt = `당신은 프롬프트 엔지니어링 전문가입니다. 학생이 작성한 프롬프트를 분석하고 피드백을 제공합니다.

다음 기준으로 프롬프트를 평가하세요:
1. 명확성: 요청이 명확한가?
2. 맥락 제공: 충분한 배경 정보가 있는가?
3. 역할 지정: AI의 역할이 정의되어 있는가?
4. 출력 형식: 원하는 결과물의 형식이 명시되어 있는가?
5. 구체성: 모호하지 않고 구체적인가?

JSON 형식으로만 응답하세요:
{
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "score": 0-100,
  "feedback": "종합 피드백"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `다음 프롬프트를 분석해주세요:\n\n${data.prompt}${data.scenarioContext ? `\n\n시나리오 맥락: ${data.scenarioContext}` : ''}`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // JSON 파싱 실패 시 기본값 반환
    }

    return {
      strengths: ['프롬프트 분석 중 오류 발생'],
      improvements: ['다시 시도해주세요'],
      score: 50,
      feedback: '프롬프트 분석에 실패했습니다.',
    };
  }

  async comparePrompts(data: ComparisonRequest): Promise<{
    responseA: string;
    responseB: string;
    analysis: string;
    betterPrompt: 'A' | 'B';
  }> {
    const systemPrompt = `당신은 프롬프트 엔지니어링 전문가입니다. 두 프롬프트를 비교 분석합니다.

각 프롬프트에 대해:
1. 프롬프트를 실행했을 때 예상되는 응답을 생성하세요
2. 두 프롬프트의 장단점을 비교 분석하세요
3. 어느 프롬프트가 더 효과적인지 판단하세요

JSON 형식으로만 응답하세요:
{
  "responseA": "프롬프트 A에 대한 예상 응답",
  "responseB": "프롬프트 B에 대한 예상 응답",
  "analysis": "비교 분석 내용",
  "betterPrompt": "A" 또는 "B"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `다음 두 프롬프트를 비교 분석해주세요:\n\n**프롬프트 A:**\n${data.promptA}\n\n**프롬프트 B:**\n${data.promptB}`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // JSON 파싱 실패 시 기본값 반환
    }

    return {
      responseA: '응답 생성 실패',
      responseB: '응답 생성 실패',
      analysis: '비교 분석에 실패했습니다.',
      betterPrompt: 'A',
    };
  }

  async *streamResponse(prompt: string): AsyncGenerator<string> {
    const words = prompt.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }
}
