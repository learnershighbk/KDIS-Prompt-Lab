import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateDialogueResponse, SendMessageResponse, GetDialogueResponse, Message, QuestionType } from './schema';

const MIN_EXCHANGES_FOR_COMPLETION = 3;

interface SocraticQuestion {
  questionType: QuestionType;
  questionText: string;
}

async function getSocraticQuestions(
  supabase: SupabaseClient,
  moduleId: string
): Promise<SocraticQuestion[]> {
  const { data: questions } = await supabase
    .from('socratic_question_templates')
    .select('question_type, question_text')
    .eq('module_id', moduleId)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  return questions?.map((q) => ({
    questionType: q.question_type as QuestionType,
    questionText: q.question_text,
  })) ?? [];
}

function getNextQuestion(
  questions: SocraticQuestion[],
  currentMessageCount: number
): SocraticQuestion | null {
  const questionIndex = Math.floor(currentMessageCount / 2);
  if (questionIndex >= questions.length) {
    return null;
  }
  return questions[questionIndex];
}

function generateFollowUpResponse(userMessage: string, nextQuestion: SocraticQuestion | null): string {
  const acknowledgments = [
    '좋은 생각이네요.',
    '흥미로운 관점입니다.',
    '그렇게 생각하시는군요.',
    '네, 이해했습니다.',
    '좋은 포인트입니다.',
  ];

  const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];

  if (!nextQuestion) {
    return `${randomAck} 지금까지의 대화를 통해 프롬프트 작성에 대한 좋은 인사이트를 얻으셨을 것 같습니다. 이제 다음 단계인 프롬프트 작성으로 넘어가볼까요?`;
  }

  return `${randomAck} ${nextQuestion.questionText}`;
}

export async function createDialogue(
  supabase: SupabaseClient,
  progressId: string,
  userId: string
): Promise<CreateDialogueResponse> {
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('id, module_id, user_id')
    .eq('id', progressId)
    .single();

  if (progressError || !progress) {
    throw new Error('Progress not found');
  }

  if (progress.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  const { data: existingDialogue } = await supabase
    .from('dialogues')
    .select('id, messages')
    .eq('progress_id', progressId)
    .single();

  if (existingDialogue) {
    const messages = existingDialogue.messages as Message[];
    const firstTutorMessage = messages.find((m) => m.role === 'tutor');
    return {
      dialogueId: existingDialogue.id,
      initialMessage: {
        role: 'tutor',
        content: firstTutorMessage?.content ?? '이 모듈에서 무엇을 배우고 싶으신가요?',
        questionType: (firstTutorMessage?.questionType ?? 'exploration') as QuestionType,
      },
    };
  }

  const questions = await getSocraticQuestions(supabase, progress.module_id);
  const firstQuestion = questions[0] ?? {
    questionType: 'exploration' as QuestionType,
    questionText: 'AI에게 질문할 때 무엇이 결과에 영향을 준다고 생각하나요?',
  };

  const initialMessage: Message = {
    role: 'tutor',
    content: firstQuestion.questionText,
    questionType: firstQuestion.questionType,
    timestamp: new Date().toISOString(),
  };

  const { data: newDialogue, error: dialogueError } = await supabase
    .from('dialogues')
    .insert({
      progress_id: progressId,
      messages: [initialMessage],
      is_completed: false,
    })
    .select('id')
    .single();

  if (dialogueError) {
    throw new Error(`Failed to create dialogue: ${dialogueError.message}`);
  }

  return {
    dialogueId: newDialogue.id,
    initialMessage: {
      role: 'tutor',
      content: firstQuestion.questionText,
      questionType: firstQuestion.questionType,
    },
  };
}

export async function sendMessage(
  supabase: SupabaseClient,
  dialogueId: string,
  content: string,
  userId: string
): Promise<SendMessageResponse> {
  const { data: dialogue, error: dialogueError } = await supabase
    .from('dialogues')
    .select('*, user_progress(user_id, module_id)')
    .eq('id', dialogueId)
    .single();

  if (dialogueError || !dialogue) {
    throw new Error('Dialogue not found');
  }

  const progressData = dialogue.user_progress as { user_id: string; module_id: string } | null;
  if (progressData?.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  if (dialogue.is_completed) {
    throw new Error('Dialogue already completed');
  }

  const messages = dialogue.messages as Message[];
  const moduleId = progressData?.module_id;

  const userMessage: Message = {
    role: 'student',
    content,
    timestamp: new Date().toISOString(),
  };

  messages.push(userMessage);

  const questions = moduleId ? await getSocraticQuestions(supabase, moduleId) : [];
  const studentMessageCount = messages.filter((m) => m.role === 'student').length;
  const nextQuestion = getNextQuestion(questions, messages.length);

  const isCompleted = studentMessageCount >= MIN_EXCHANGES_FOR_COMPLETION && !nextQuestion;
  const canProceed = studentMessageCount >= MIN_EXCHANGES_FOR_COMPLETION;

  const tutorContent = generateFollowUpResponse(content, nextQuestion);
  const tutorResponse: Message = {
    role: 'tutor',
    content: tutorContent,
    questionType: nextQuestion?.questionType ?? 'reflection',
    timestamp: new Date().toISOString(),
  };

  messages.push(tutorResponse);

  const { error: updateError } = await supabase
    .from('dialogues')
    .update({
      messages,
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dialogueId);

  if (updateError) {
    throw new Error(`Failed to update dialogue: ${updateError.message}`);
  }

  return {
    userMessage: {
      role: 'student',
      content: userMessage.content,
      timestamp: userMessage.timestamp,
    },
    tutorResponse: {
      role: 'tutor',
      content: tutorResponse.content,
      questionType: tutorResponse.questionType as QuestionType,
      timestamp: tutorResponse.timestamp,
    },
    isCompleted,
    canProceed,
  };
}

export async function getDialogue(
  supabase: SupabaseClient,
  dialogueId: string,
  userId: string
): Promise<GetDialogueResponse> {
  const { data: dialogue, error: dialogueError } = await supabase
    .from('dialogues')
    .select('*, user_progress(user_id)')
    .eq('id', dialogueId)
    .single();

  if (dialogueError || !dialogue) {
    throw new Error('Dialogue not found');
  }

  const progressData = dialogue.user_progress as { user_id: string } | null;
  if (progressData?.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  return {
    dialogueId: dialogue.id,
    messages: dialogue.messages as Message[],
    isCompleted: dialogue.is_completed,
  };
}
