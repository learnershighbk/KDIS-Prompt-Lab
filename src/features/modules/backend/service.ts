import type { SupabaseClient } from '@supabase/supabase-js';
import type { ModulesListResponse, ModuleDetailResponse } from './schema';

const STEP_ORDER = ['socratic_dialogue', 'prompt_writing', 'comparison_lab', 'reflection_journal'] as const;
const STEP_TITLES: Record<string, string> = {
  socratic_dialogue: '소크라테스 대화',
  prompt_writing: '프롬프트 작성',
  comparison_lab: '비교 실험실',
  reflection_journal: '성찰 저널',
};

function calculateStepPercentage(currentStep: string | null, isCompleted: boolean): number {
  if (isCompleted) return 100;
  if (!currentStep) return 0;
  const stepIndex = STEP_ORDER.indexOf(currentStep as typeof STEP_ORDER[number]);
  if (stepIndex === -1) return 0;
  return Math.round((stepIndex / STEP_ORDER.length) * 100);
}

export async function getModulesWithProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ModulesListResponse> {
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (modulesError) {
    throw new Error(`Failed to fetch modules: ${modulesError.message}`);
  }

  const { data: progressList, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (progressError) {
    throw new Error(`Failed to fetch progress: ${progressError.message}`);
  }

  const progressMap = new Map(
    progressList?.map((p) => [p.module_id, p]) ?? []
  );

  const completedModuleIds = new Set(
    progressList?.filter((p) => p.status === 'completed').map((p) => p.module_id) ?? []
  );

  const modulesWithProgress = modules?.map((module) => {
    const progress = progressMap.get(module.id);
    const isLocked = module.prerequisite_module_id
      ? !completedModuleIds.has(module.prerequisite_module_id)
      : false;

    return {
      id: module.id,
      title: module.title,
      titleEn: module.title_en,
      description: module.description,
      descriptionEn: module.description_en,
      techniques: module.techniques ?? [],
      policyContext: module.policy_context,
      orderIndex: module.order_index,
      isActive: module.is_active,
      prerequisiteModuleId: module.prerequisite_module_id,
      isLocked,
      progress: progress
        ? {
            status: progress.status as 'not_started' | 'in_progress' | 'completed',
            currentStep: progress.current_step,
            percentage: calculateStepPercentage(progress.current_step, progress.status === 'completed'),
          }
        : null,
    };
  }) ?? [];

  const completedCount = modulesWithProgress.filter(
    (m) => m.progress?.status === 'completed'
  ).length;

  return {
    modules: modulesWithProgress,
    overallProgress: {
      completed: completedCount,
      total: modulesWithProgress.length,
      percentage: modulesWithProgress.length > 0
        ? Math.round((completedCount / modulesWithProgress.length) * 100)
        : 0,
    },
  };
}

export async function getModuleDetail(
  supabase: SupabaseClient,
  moduleId: string,
  userId: string
): Promise<ModuleDetailResponse> {
  const { data: module, error: moduleError } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .eq('is_active', true)
    .single();

  if (moduleError || !module) {
    throw new Error('Module not found');
  }

  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('module_id', moduleId)
    .eq('is_active', true);

  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();

  const currentStep = progress?.current_step ?? 'socratic_dialogue';
  const isCompleted = progress?.status === 'completed';

  const steps = STEP_ORDER.map((stepType) => {
    const stepIndex = STEP_ORDER.indexOf(stepType);
    const currentIndex = STEP_ORDER.indexOf(currentStep as typeof STEP_ORDER[number]);

    return {
      type: stepType,
      title: STEP_TITLES[stepType],
      isCompleted: isCompleted || stepIndex < currentIndex,
      isCurrent: !isCompleted && stepType === currentStep,
    };
  });

  return {
    module: {
      id: module.id,
      title: module.title,
      titleEn: module.title_en,
      description: module.description,
      descriptionEn: module.description_en,
      techniques: module.techniques ?? [],
      policyContext: module.policy_context,
      orderIndex: module.order_index,
      isActive: module.is_active,
      prerequisiteModuleId: module.prerequisite_module_id,
      steps,
      scenarios: scenarios?.map((s) => ({
        id: s.id,
        title: s.title,
        titleEn: s.title_en,
        category: s.category,
        context: s.context,
        contextEn: s.context_en,
      })) ?? [],
    },
    progress: progress
      ? {
          status: progress.status as 'not_started' | 'in_progress' | 'completed',
          currentStep: progress.current_step,
          startedAt: progress.started_at,
        }
      : null,
  };
}

export async function startModule(
  supabase: SupabaseClient,
  moduleId: string,
  userId: string
): Promise<{ progressId: string; initialMessage: string }> {
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();

  if (existingProgress) {
    const { data: questions } = await supabase
      .from('socratic_question_templates')
      .select('question_text')
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(1);

    return {
      progressId: existingProgress.id,
      initialMessage: questions?.[0]?.question_text ?? '이 모듈에서 무엇을 배우고 싶으신가요?',
    };
  }

  const { data: module } = await supabase
    .from('modules')
    .select('prerequisite_module_id')
    .eq('id', moduleId)
    .single();

  if (module?.prerequisite_module_id) {
    const { data: prerequisiteProgress } = await supabase
      .from('user_progress')
      .select('status')
      .eq('user_id', userId)
      .eq('module_id', module.prerequisite_module_id)
      .eq('status', 'completed')
      .single();

    if (!prerequisiteProgress) {
      throw new Error('이전 모듈을 먼저 완료해야 합니다.');
    }
  }

  const { data: newProgress, error: progressError } = await supabase
    .from('user_progress')
    .insert({
      user_id: userId,
      module_id: moduleId,
      status: 'in_progress',
      current_step: 'socratic_dialogue',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (progressError) {
    throw new Error(`Failed to create progress: ${progressError.message}`);
  }

  const { data: questions } = await supabase
    .from('socratic_question_templates')
    .select('question_text')
    .eq('module_id', moduleId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .limit(1);

  return {
    progressId: newProgress.id,
    initialMessage: questions?.[0]?.question_text ?? '이 모듈에서 무엇을 배우고 싶으신가요?',
  };
}
