import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProgressOverviewResponse, CompleteStepResponse, StepType } from './schema';

const STEP_ORDER: StepType[] = [
  'socratic_dialogue',
  'prompt_writing',
  'comparison_lab',
  'reflection_journal',
];

const TOTAL_STEPS = STEP_ORDER.length;

function getStepsCompleted(currentStep: StepType | null, isCompleted: boolean): number {
  if (isCompleted) return TOTAL_STEPS;
  if (!currentStep) return 0;
  return STEP_ORDER.indexOf(currentStep);
}

function getNextStep(currentStep: StepType): StepType | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
    return null;
  }
  return STEP_ORDER[currentIndex + 1];
}

export async function getProgressOverview(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgressOverviewResponse> {
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  const { data: progressList } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  const { data: badges } = await supabase
    .from('technique_badges')
    .select('technique_name, earned_at, modules(title)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  const progressMap = new Map(
    progressList?.map((p) => [p.module_id, p]) ?? []
  );

  const moduleProgress = modules?.map((m) => {
    const progress = progressMap.get(m.id);
    return {
      moduleId: m.id,
      moduleTitle: m.title,
      status: (progress?.status ?? 'not_started') as 'not_started' | 'in_progress' | 'completed',
      currentStep: progress?.current_step ?? null,
      stepsCompleted: getStepsCompleted(progress?.current_step, progress?.status === 'completed'),
      totalSteps: TOTAL_STEPS,
      completedAt: progress?.completed_at ?? null,
    };
  }) ?? [];

  const completedCount = moduleProgress.filter((m) => m.status === 'completed').length;
  const totalCount = moduleProgress.length;

  const recentActivity: ProgressOverviewResponse['recentActivity'] = [];
  progressList?.forEach((p) => {
    const moduleTitle = modules?.find((m) => m.id === p.module_id)?.title ?? '';
    if (p.started_at) {
      recentActivity.push({
        type: 'module_started',
        moduleTitle,
        timestamp: p.started_at,
      });
    }
    if (p.completed_at) {
      recentActivity.push({
        type: 'module_completed',
        moduleTitle,
        timestamp: p.completed_at,
      });
    }
  });

  recentActivity.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    overall: {
      completedModules: completedCount,
      totalModules: totalCount,
      percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    },
    modules: moduleProgress,
    badges: badges?.map((b) => ({
      technique: b.technique_name,
      moduleTitle: (b.modules as { title: string } | null)?.title ?? '',
      earnedAt: b.earned_at,
    })) ?? [],
    recentActivity: recentActivity.slice(0, 10),
  };
}

export async function completeStep(
  supabase: SupabaseClient,
  progressId: string,
  stepType: StepType,
  userId: string
): Promise<CompleteStepResponse> {
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('*, modules(techniques, order_index)')
    .eq('id', progressId)
    .eq('user_id', userId)
    .single();

  if (progressError || !progress) {
    throw new Error('Progress not found');
  }

  if (progress.current_step !== stepType) {
    throw new Error('Invalid step type');
  }

  const nextStep = getNextStep(stepType);
  const moduleCompleted = nextStep === null;

  const updateData: Record<string, unknown> = {
    current_step: nextStep,
    updated_at: new Date().toISOString(),
  };

  if (moduleCompleted) {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('user_progress')
    .update(updateData)
    .eq('id', progressId);

  if (updateError) {
    throw new Error(`Failed to update progress: ${updateError.message}`);
  }

  let unlockedModule: string | null = null;

  if (moduleCompleted) {
    const moduleData = progress.modules as { techniques: string[]; order_index: number } | null;
    const techniques = moduleData?.techniques ?? [];

    for (const technique of techniques) {
      await supabase.from('technique_badges').upsert({
        user_id: userId,
        technique_name: technique,
        module_id: progress.module_id,
        earned_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,technique_name',
      });
    }

    const currentOrderIndex = moduleData?.order_index ?? 0;
    const { data: nextModule } = await supabase
      .from('modules')
      .select('id, title')
      .eq('is_active', true)
      .eq('order_index', currentOrderIndex + 1)
      .single();

    if (nextModule) {
      unlockedModule = nextModule.title;
    }
  }

  return {
    nextStep,
    moduleCompleted,
    unlockedModule,
  };
}
