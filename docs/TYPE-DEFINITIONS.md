# Prompt Lab 타입 정의

## 1. 도메인 엔티티 타입

### 1.1 User 관련

```typescript
// src/types/user.types.ts

export type UserRole = 'student' | 'instructor' | 'admin';
export type PreferredLanguage = 'ko' | 'en';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  preferredLanguage: PreferredLanguage;
  studentId: string | null;
  department: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends User {
  profile: Profile;
  roles: UserRole[];
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: UserWithProfile;
}
```

### 1.2 Module 관련

```typescript
// src/types/module.types.ts

export type StepType = 
  | 'socratic_dialogue' 
  | 'prompt_writing' 
  | 'comparison_lab' 
  | 'reflection_journal';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type TechniqueName = 
  | 'Chain of Thought'
  | 'Few-shot Learning'
  | 'Output Structuring'
  | 'Self-Consistency'
  | 'Persona'
  | 'Constraints';

export interface Module {
  id: string;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  techniques: TechniqueName[];
  policyContext: string;
  orderIndex: number;
  isActive: boolean;
  prerequisiteModuleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleStep {
  type: StepType;
  title: string;
  titleEn: string;
  order: number;
}

export const MODULE_STEPS: ModuleStep[] = [
  { type: 'socratic_dialogue', title: '소크라테스 대화', titleEn: 'Socratic Dialogue', order: 1 },
  { type: 'prompt_writing', title: '프롬프트 작성', titleEn: 'Prompt Writing', order: 2 },
  { type: 'comparison_lab', title: '비교 실험실', titleEn: 'Comparison Lab', order: 3 },
  { type: 'reflection_journal', title: '성찰 저널', titleEn: 'Reflection Journal', order: 4 },
];

export interface ModuleWithProgress extends Module {
  isLocked: boolean;
  progress: UserProgress | null;
}
```

### 1.3 Scenario 관련

```typescript
// src/types/scenario.types.ts

export type ScenarioCategory = 
  | 'literature_review'
  | 'policy_comparison'
  | 'data_analysis'
  | 'policy_document'
  | 'research_design'
  | 'stakeholder_analysis';

export interface Scenario {
  id: string;
  moduleId: string;
  category: ScenarioCategory;
  title: string;
  titleEn: string | null;
  context: string;
  contextEn: string | null;
  basePromptExample: string | null;
  improvedPromptExample: string;
  comparisonCriteria: ComparisonCriteria;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonCriteria {
  specificity: CriterionConfig;
  context: CriterionConfig;
  persona: CriterionConfig;
  outputFormat: CriterionConfig;
  constraints: CriterionConfig;
  examples: CriterionConfig;
}

export interface CriterionConfig {
  weight: number;  // 1-5
  description: string;
  keywords: string[];
}
```

### 1.4 Progress 관련

```typescript
// src/types/progress.types.ts

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  currentStep: StepType;
  status: ProgressStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  score: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressWithModule extends UserProgress {
  module: Module;
}

export interface OverallProgress {
  completedModules: number;
  totalModules: number;
  percentage: number;
  currentModule: ModuleWithProgress | null;
}

export interface StepProgress {
  stepType: StepType;
  isCompleted: boolean;
  completedAt: Date | null;
}
```

### 1.5 Dialogue 관련

```typescript
// src/types/dialogue.types.ts

export type MessageRole = 'tutor' | 'student';
export type QuestionType = 
  | 'exploration'      // 탐색 질문
  | 'clarification'    // 명료화 질문
  | 'assumption'       // 가정 검증 질문
  | 'prediction';      // 결과 예측 질문

export interface DialogueMessage {
  id: string;
  role: MessageRole;
  content: string;
  questionType?: QuestionType;  // tutor 메시지에만 적용
  timestamp: Date;
}

export interface Dialogue {
  id: string;
  progressId: string;
  messages: DialogueMessage[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DialogueContext {
  moduleId: string;
  moduleTechniques: TechniqueName[];
  messageHistory: DialogueMessage[];
  currentPhase: 'introduction' | 'exploration' | 'deepening' | 'conclusion';
}
```

### 1.6 Prompt 관련

```typescript
// src/types/prompt.types.ts

export interface PromptAttempt {
  id: string;
  userId: string;
  scenarioId: string;
  progressId: string | null;
  userPrompt: string;
  aiResponse: string | null;
  responseMetadata: ResponseMetadata;
  createdAt: Date;
}

export interface ResponseMetadata {
  model: string;
  tokens: number;
  latencyMs: number;
}

export interface PromptWithScenario extends PromptAttempt {
  scenario: Scenario;
}
```

### 1.7 Comparison 관련

```typescript
// src/types/comparison.types.ts

export interface Comparison {
  id: string;
  attemptId: string;
  userResponse: string;
  improvedPrompt: string;
  improvedResponse: string;
  analysis: PromptAnalysis;
  createdAt: Date;
}

export interface PromptAnalysis {
  specificity: AnalysisDimension;
  context: AnalysisDimension;
  persona: AnalysisDimension;
  outputFormat: AnalysisDimension;
  constraints: AnalysisDimension;
  examples: AnalysisDimension;
  overallScore: number;
  keyDifferences: string[];
  suggestions: string[];
}

export interface AnalysisDimension {
  score: number;        // 1-5
  feedback: string;
  isPresent: boolean;
}
```

### 1.8 Reflection 관련

```typescript
// src/types/reflection.types.ts

export interface Reflection {
  id: string;
  progressId: string;
  content: string;
  insights: ReflectionInsights;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReflectionInsights {
  keyLearnings: string[];
  nextSteps: string[];
  techniquesRecognized: TechniqueName[];
}

export interface ReflectionWithModule extends Reflection {
  moduleTitle: string;
  moduleTechniques: TechniqueName[];
}
```

### 1.9 Badge 관련

```typescript
// src/types/badge.types.ts

export interface TechniqueBadge {
  id: string;
  userId: string;
  techniqueName: TechniqueName;
  moduleId: string;
  earnedAt: Date;
}

export interface BadgeWithModule extends TechniqueBadge {
  moduleTitle: string;
}

export interface BadgeProgress {
  technique: TechniqueName;
  isEarned: boolean;
  earnedAt: Date | null;
  moduleTitle: string | null;
}
```

## 2. API 요청/응답 타입

### 2.1 공통

```typescript
// src/types/api.types.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
```

### 2.2 Auth

```typescript
// src/types/auth.types.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  studentId?: string;
  preferredLanguage?: PreferredLanguage;
}

export interface AuthResponse {
  user: UserWithProfile;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}
```

### 2.3 Dialogue

```typescript
// src/types/dialogue.types.ts

export interface CreateDialogueRequest {
  progressId: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface DialogueResponse {
  dialogueId: string;
  userMessage: DialogueMessage;
  tutorResponse: DialogueMessage;
  isCompleted: boolean;
  canProceed: boolean;
}

export interface StreamDialogueRequest {
  dialogueId: string;
  userMessage: string;
}
```

### 2.4 Prompt

```typescript
// src/types/prompt.types.ts

export interface SubmitPromptRequest {
  scenarioId: string;
  progressId: string;
  userPrompt: string;
}

export interface PromptSubmitResponse {
  attemptId: string;
  aiResponse: string;
  metadata: ResponseMetadata;
}
```

### 2.5 Comparison

```typescript
// src/types/comparison.types.ts

export interface CreateComparisonRequest {
  attemptId: string;
}

export interface ComparisonResponse {
  comparisonId: string;
  userPrompt: string;
  userResponse: string;
  improvedPrompt: string;
  improvedResponse: string;
  analysis: PromptAnalysis;
}
```

## 3. Store 상태 타입

```typescript
// src/stores/types.ts

export interface AuthState {
  user: UserWithProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}

export interface ModuleState {
  modules: ModuleWithProgress[];
  currentModule: ModuleWithProgress | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchModules: () => Promise<void>;
  selectModule: (moduleId: string) => void;
  startModule: (moduleId: string) => Promise<void>;
}

export interface ProgressState {
  currentProgress: UserProgress | null;
  overallProgress: OverallProgress | null;
  badges: BadgeWithModule[];
  isLoading: boolean;
  
  // Actions
  fetchProgress: () => Promise<void>;
  completeStep: (stepType: StepType) => Promise<void>;
  updateCurrentStep: (step: StepType) => void;
}

export interface DialogueState {
  currentDialogue: Dialogue | null;
  isStreaming: boolean;
  streamingContent: string;
  
  // Actions
  startDialogue: (progressId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  streamMessage: (content: string) => AsyncGenerator<string>;
}
```

## 4. UI 컴포넌트 Props 타입

```typescript
// src/components/types.ts

export interface ModuleCardProps {
  module: ModuleWithProgress;
  onSelect: (moduleId: string) => void;
  isActive?: boolean;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface StepIndicatorProps {
  steps: ModuleStep[];
  currentStep: StepType;
  completedSteps: StepType[];
}

export interface ChatBubbleProps {
  message: DialogueMessage;
  isStreaming?: boolean;
}

export interface ComparisonPanelProps {
  leftTitle: string;
  leftContent: string;
  rightTitle: string;
  rightContent: string;
  analysis?: PromptAnalysis;
}

export interface BadgeDisplayProps {
  badges: BadgeProgress[];
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}
```

## 5. Form 유효성 검사 스키마 (Zod)

```typescript
// src/lib/validations/index.ts

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  studentId: z.string().optional(),
  preferredLanguage: z.enum(['ko', 'en']).default('ko'),
});

export const promptSubmitSchema = z.object({
  scenarioId: z.string().uuid(),
  progressId: z.string().uuid(),
  userPrompt: z.string()
    .min(10, '프롬프트는 최소 10자 이상이어야 합니다')
    .max(2000, '프롬프트는 2000자를 초과할 수 없습니다'),
});

export const reflectionSchema = z.object({
  progressId: z.string().uuid(),
  content: z.string()
    .min(50, '성찰 내용은 최소 50자 이상이어야 합니다')
    .max(5000, '성찰 내용은 5000자를 초과할 수 없습니다'),
  insights: z.object({
    keyLearnings: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional(),
  }).optional(),
});

export const dialogueMessageSchema = z.object({
  content: z.string()
    .min(1, '메시지를 입력해주세요')
    .max(1000, '메시지는 1000자를 초과할 수 없습니다'),
});

// Type inference
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PromptSubmitInput = z.infer<typeof promptSubmitSchema>;
export type ReflectionInput = z.infer<typeof reflectionSchema>;
export type DialogueMessageInput = z.infer<typeof dialogueMessageSchema>;
```

## 6. 상수 정의

```typescript
// src/constants/index.ts

export const STEP_TITLES: Record<StepType, { ko: string; en: string }> = {
  socratic_dialogue: { ko: '소크라테스 대화', en: 'Socratic Dialogue' },
  prompt_writing: { ko: '프롬프트 작성', en: 'Prompt Writing' },
  comparison_lab: { ko: '비교 실험실', en: 'Comparison Lab' },
  reflection_journal: { ko: '성찰 저널', en: 'Reflection Journal' },
};

export const TECHNIQUE_BADGES: Record<TechniqueName, { icon: string; description: { ko: string; en: string } }> = {
  'Chain of Thought': {
    icon: '🔗',
    description: { 
      ko: '단계별 사고 유도', 
      en: 'Step-by-step reasoning' 
    },
  },
  'Few-shot Learning': {
    icon: '📚',
    description: { 
      ko: '예시 기반 학습', 
      en: 'Example-based learning' 
    },
  },
  // ... 기타 테크닉
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, { ko: string; en: string }> = {
  exploration: { ko: '탐색 질문', en: 'Exploration Question' },
  clarification: { ko: '명료화 질문', en: 'Clarification Question' },
  assumption: { ko: '가정 검증 질문', en: 'Assumption Question' },
  prediction: { ko: '결과 예측 질문', en: 'Prediction Question' },
};
```
