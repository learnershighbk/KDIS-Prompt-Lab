import type { SupabaseClient } from '@supabase/supabase-js';
import type { SocraticRequest, PromptAnalysisRequest, ComparisonRequest } from './schema';

interface SocraticQuestion {
  question: string;
  followUps: string[];
}

const socraticQuestionsByModule: Record<string, SocraticQuestion[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      question: '좋은 관점이에요! 그렇다면 "구체적인 질문"이란 정확히 무엇을 의미한다고 생각하시나요?',
      followUps: [
        '예를 들어, 어떤 요소들이 질문을 더 구체적으로 만들까요?',
        '반대로, 모호한 질문의 특징은 무엇일까요?',
      ],
    },
    {
      question: '흥미로운 생각이네요. 맥락(context)을 제공하는 것이 왜 중요할까요?',
      followUps: [
        'AI가 맥락 없이 질문을 받으면 어떤 어려움이 있을까요?',
        '어느 정도의 맥락이 적절할까요?',
      ],
    },
    {
      question: '그 아이디어를 더 발전시켜볼까요? 역할을 지정하면 AI의 답변이 어떻게 달라질까요?',
      followUps: [
        '"정책 분석가로서" vs "일반인으로서" 답변의 차이는?',
        '어떤 역할을 지정하면 좋을까요?',
      ],
    },
  ],
  '22222222-2222-2222-2222-222222222222': [
    {
      question: '문헌 리뷰에서 AI를 활용할 때 가장 중요한 점은 무엇일까요?',
      followUps: [
        '요약의 정확성을 어떻게 확인할 수 있을까요?',
        '핵심 논점을 추출하는 기준은?',
      ],
    },
  ],
};

export class AIService {
  constructor(private supabase: SupabaseClient) {}

  async generateSocraticResponse(data: SocraticRequest): Promise<string> {
    const questions = socraticQuestionsByModule[data.moduleId] || socraticQuestionsByModule['11111111-1111-1111-1111-111111111111'];
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];

    const responses = [
      selectedQuestion.question,
      `${selectedQuestion.question}\n\n${selectedQuestion.followUps[0]}`,
      `좋은 지적입니다! ${selectedQuestion.followUps[Math.floor(Math.random() * selectedQuestion.followUps.length)]}`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async analyzePrompt(data: PromptAnalysisRequest): Promise<{
    strengths: string[];
    improvements: string[];
    score: number;
    feedback: string;
  }> {
    const promptLength = data.prompt.length;
    const hasRole = /로서|으로서|역할/.test(data.prompt);
    const hasContext = data.prompt.length > 100;
    const hasFormat = /표|목록|단계|형식/.test(data.prompt);

    const strengths: string[] = [];
    const improvements: string[] = [];
    let score = 50;

    if (hasRole) {
      strengths.push('역할이 명확하게 지정되어 있습니다');
      score += 15;
    } else {
      improvements.push('역할을 지정하면 더 전문적인 답변을 얻을 수 있습니다');
    }

    if (hasContext) {
      strengths.push('충분한 맥락이 제공되어 있습니다');
      score += 15;
    } else {
      improvements.push('더 많은 맥락과 배경 정보를 추가해보세요');
    }

    if (hasFormat) {
      strengths.push('출력 형식이 명시되어 있습니다');
      score += 10;
    } else {
      improvements.push('원하는 출력 형식(표, 목록, 단계별 등)을 명시해보세요');
    }

    if (promptLength > 200) {
      strengths.push('상세한 요구사항이 포함되어 있습니다');
      score += 10;
    }

    return {
      strengths,
      improvements,
      score: Math.min(score, 100),
      feedback: `프롬프트 분석 결과, ${score}점을 받았습니다. ${strengths.length > 0 ? strengths[0] : '기본적인 구조는 갖추었습니다.'} ${improvements.length > 0 ? improvements[0] : ''}`,
    };
  }

  async comparePrompts(data: ComparisonRequest): Promise<{
    responseA: string;
    responseB: string;
    analysis: string;
    betterPrompt: 'A' | 'B';
  }> {
    const analysisA = await this.analyzePrompt({
      moduleId: data.moduleId,
      prompt: data.promptA,
    });
    const analysisB = await this.analyzePrompt({
      moduleId: data.moduleId,
      prompt: data.promptB,
    });

    const betterPrompt = analysisA.score >= analysisB.score ? 'A' : 'B';

    return {
      responseA: `프롬프트 A에 대한 응답:\n\n${data.promptA.length < 50 ? '(간단한 응답)' : '(상세한 응답)'}\n\n점수: ${analysisA.score}/100`,
      responseB: `프롬프트 B에 대한 응답:\n\n${data.promptB.length < 50 ? '(간단한 응답)' : '(상세한 응답)'}\n\n점수: ${analysisB.score}/100`,
      analysis: `**비교 분석 결과**\n\n프롬프트 ${betterPrompt}가 더 효과적입니다.\n\n**프롬프트 A (${analysisA.score}점)**\n- 강점: ${analysisA.strengths.join(', ') || '없음'}\n- 개선점: ${analysisA.improvements.join(', ') || '없음'}\n\n**프롬프트 B (${analysisB.score}점)**\n- 강점: ${analysisB.strengths.join(', ') || '없음'}\n- 개선점: ${analysisB.improvements.join(', ') || '없음'}`,
      betterPrompt,
    };
  }

  async *streamResponse(prompt: string): AsyncGenerator<string> {
    const words = prompt.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
