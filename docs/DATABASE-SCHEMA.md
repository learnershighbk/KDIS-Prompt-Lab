# Prompt Lab 데이터베이스 스키마

## 1. 개요

Supabase(PostgreSQL)를 사용합니다. RLS(Row Level Security)는 사용하지 않으며, 애플리케이션 레벨에서 권한을 관리합니다.

## 2. ERD (Entity Relationship Diagram)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    profiles     │     │   user_roles    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │←────│ id (PK, FK)     │     │ id (PK)         │
│ email           │     │ full_name       │     │ user_id (FK)    │
│ created_at      │     │ avatar_url      │     │ role            │
│                 │     │ preferred_lang  │     │ assigned_at     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               │
┌─────────────────┐     ┌─────────────────┐             │
│ user_progress   │     │    modules      │             │
├─────────────────┤     ├─────────────────┤             │
│ id (PK)         │     │ id (PK)         │◄────────────┘
│ user_id (FK)    │────→│ title           │
│ module_id (FK)  │     │ description     │
│ current_step    │     │ techniques      │
│ status          │     │ order_index     │
│ completed_at    │     │ is_locked       │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ step_attempts   │     │   scenarios     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ progress_id(FK) │     │ module_id (FK)  │
│ step_type       │     │ category        │
│ content         │     │ title           │
│ created_at      │     │ context         │
└─────────────────┘     │ base_prompt(NN) │
                        │ improved_prompt │
                        └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐
│ prompt_attempts │     │ comparisons     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ attempt_id (FK) │
│ scenario_id(FK) │     │ user_response   │
│ user_prompt     │     │ improved_resp   │
│ ai_response     │     │ analysis        │
│ created_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ dialogues       │     │ reflections     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ progress_id(FK) │     │ progress_id(FK) │
│ messages (JSON) │     │ content         │
│ created_at      │     │ insights        │
│ updated_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ technique_badges│     │ peer_reviews    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ attempt_id (FK) │
│ technique_name  │     │ reviewer_id(FK) │
│ earned_at       │     │ scores (JSON)   │
│ module_id (FK)  │     │ feedback        │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────────────┐
│    resources    │     │ socratic_question_      │
├─────────────────┤     │ templates               │
│ id (PK)         │     ├─────────────────────────┤
│ title           │     │ id (PK)                 │
│ description     │     │ module_id (FK)          │
│ category        │     │ question_type           │
│ type            │     │ question_text           │
│ url             │     │ order_index             │
│ techniques      │     │ is_active               │
└─────────────────┘     └─────────────────────────┘
```

## 3. 테이블 정의

### 3.1 users (Supabase Auth 기본)

Supabase Auth에서 자동 관리되는 테이블입니다.

### 3.2 profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ko' CHECK (preferred_language IN ('ko', 'en')),
  student_id TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 자동 업데이트 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 user_roles

```sql
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
```

### 3.4 modules

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  techniques TEXT[] NOT NULL, -- ['Chain of Thought', 'Few-shot']
  policy_context TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  prerequisite_module_id UUID REFERENCES modules(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 샘플 데이터
INSERT INTO modules (title, title_en, techniques, policy_context, order_index) VALUES
('좋은 질문이 좋은 답을 만든다', 'Good Questions Make Good Answers', 
 ARRAY['Chain of Thought'], '정책 이슈 질문', 1),
('문헌 리뷰 효과적으로 하기', 'Effective Literature Review', 
 ARRAY['Few-shot Learning', 'Output Structuring'], '캡스톤 선행연구', 2),
('정책 비교 분석 요청하기', 'Policy Comparison Analysis', 
 ARRAY['Chain of Thought', 'Output Structuring', 'Self-Consistency'], '국가 간 정책 비교', 3),
('데이터 해석 도움받기', 'Getting Help with Data Interpretation', 
 ARRAY['Persona', 'Chain of Thought', 'Few-shot Learning'], '통계/회귀분석 해석', 4),
('정책 문서 작성 지원받기', 'Policy Document Writing Support', 
 ARRAY['Persona', 'Few-shot Learning', 'Constraints'], '브리핑/메모/제안서', 5);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
```

### 3.5 scenarios

```sql
CREATE TYPE scenario_category AS ENUM (
  'literature_review', 
  'policy_comparison', 
  'data_analysis', 
  'policy_document', 
  'research_design', 
  'stakeholder_analysis'
);

CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  category scenario_category NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  context TEXT NOT NULL,
  context_en TEXT,
  base_prompt_example TEXT NOT NULL, -- 비교 실험실 핵심: 학생 프롬프트(예상) vs 개선 프롬프트 비교
  improved_prompt_example TEXT NOT NULL,
  comparison_criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_scenarios_module ON scenarios(module_id);
CREATE INDEX idx_scenarios_category ON scenarios(category);
```

### 3.6 user_progress

```sql
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE step_type AS ENUM ('socratic_dialogue', 'prompt_writing', 'comparison_lab', 'reflection_journal');

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  current_step step_type DEFAULT 'socratic_dialogue',
  status progress_status DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_module ON user_progress(module_id);
CREATE INDEX idx_progress_status ON user_progress(status);
```

### 3.7 dialogues

```sql
CREATE TABLE dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  -- messages format: [{role: 'tutor'|'student', content: string, timestamp: string}]
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE dialogues DISABLE ROW LEVEL SECURITY;
```

### 3.8 prompt_attempts

```sql
CREATE TABLE prompt_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES user_progress(id) ON DELETE SET NULL,
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  response_metadata JSONB DEFAULT '{}',
  -- metadata: {model: string, tokens: number, latency_ms: number}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE prompt_attempts DISABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX idx_attempts_user ON prompt_attempts(user_id);
CREATE INDEX idx_attempts_scenario ON prompt_attempts(scenario_id);
```

### 3.9 comparisons

```sql
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES prompt_attempts(id) ON DELETE CASCADE,
  user_response TEXT NOT NULL,
  improved_prompt TEXT NOT NULL,
  improved_response TEXT NOT NULL,
  analysis JSONB NOT NULL,
  -- analysis format: {
  --   specificity: {score: 1-5, feedback: string},
  --   context: {score: 1-5, feedback: string},
  --   persona: {score: 1-5, feedback: string},
  --   output_format: {score: 1-5, feedback: string},
  --   constraints: {score: 1-5, feedback: string},
  --   examples: {score: 1-5, feedback: string}
  -- }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE comparisons DISABLE ROW LEVEL SECURITY;
```

### 3.10 reflections

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  insights JSONB DEFAULT '{}',
  -- insights: {key_learning: string[], next_steps: string[]}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE reflections DISABLE ROW LEVEL SECURITY;
```

### 3.11 technique_badges

```sql
CREATE TABLE technique_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_name TEXT NOT NULL,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, technique_name)
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE technique_badges DISABLE ROW LEVEL SECURITY;
```

### 3.12 resources

```sql
CREATE TYPE resource_category AS ENUM ('technique', 'guide', 'video', 'advanced');
CREATE TYPE resource_type AS ENUM ('article', 'video', 'document', 'course');

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  category resource_category NOT NULL,
  type resource_type NOT NULL,
  url TEXT NOT NULL,
  techniques TEXT[] DEFAULT '{}', -- 관련 테크닉 (예: ['Chain of Thought', 'Few-shot'])
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_type ON resources(type);

-- 자동 업데이트 트리거
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터
INSERT INTO resources (title, title_en, description, category, type, url, techniques) VALUES
-- 테크닉 정리
('Chain of Thought 가이드', 'Chain of Thought Guide', '단계별 사고 유도 테크닉 설명', 'technique', 'article', '#', ARRAY['Chain of Thought']),
('Few-shot Learning 가이드', 'Few-shot Learning Guide', '예시 기반 학습 유도 테크닉', 'technique', 'article', '#', ARRAY['Few-shot Learning']),
('Persona 설정 가이드', 'Persona Setting Guide', '전문가 정체성 부여 테크닉', 'technique', 'article', '#', ARRAY['Persona']),
-- 공식 가이드
('Anthropic Prompt Engineering Guide', 'Anthropic Prompt Engineering Guide', 'Claude 공식 프롬프트 엔지니어링 가이드', 'guide', 'document', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', ARRAY[]::TEXT[]),
('OpenAI Prompt Engineering Guide', 'OpenAI Prompt Engineering Guide', 'OpenAI 공식 프롬프트 가이드', 'guide', 'document', 'https://platform.openai.com/docs/guides/prompt-engineering', ARRAY[]::TEXT[]),
('DAIR.AI Prompt Engineering Guide', 'DAIR.AI Prompt Engineering Guide (Korean)', '한국어 프롬프트 엔지니어링 가이드', 'guide', 'document', 'https://www.promptingguide.ai/kr', ARRAY[]::TEXT[]),
-- 추천 영상
('Anthropic YouTube 채널', 'Anthropic YouTube Channel', 'Claude 공식 튜토리얼', 'video', 'video', 'https://www.youtube.com/@anthropic-ai', ARRAY[]::TEXT[]),
('AI Jason 채널', 'AI Jason Channel', '실용적 프롬프트 팁', 'video', 'video', 'https://www.youtube.com/@AIJasonZ', ARRAY[]::TEXT[]),
-- 심화 학습
('DeepLearning.AI 프롬프트 코스', 'DeepLearning.AI Prompt Course', 'ChatGPT 프롬프트 엔지니어링 무료 코스', 'advanced', 'course', 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', ARRAY[]::TEXT[]),
('Chain-of-Thought 논문', 'Chain-of-Thought Paper', 'CoT 기법 원본 학술 논문', 'advanced', 'document', 'https://arxiv.org/abs/2201.11903', ARRAY['Chain of Thought']);
```

### 3.13 socratic_question_templates

소크라테스식 대화에서 사용되는 유도 질문 템플릿을 관리합니다.

```sql
CREATE TYPE question_type AS ENUM (
  'exploration',       -- 탐색 질문: 기존 지식 확인
  'clarification',     -- 명료화 질문: 생각 구체화
  'assumption',        -- 가정 검증 질문: 전제 점검
  'consequence',       -- 결과 예측 질문: 비판적 사고
  'reflection'         -- 성찰 질문: 배운 점 정리
);

CREATE TABLE socratic_question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question_type question_type NOT NULL,
  question_text TEXT NOT NULL,
  question_text_en TEXT,
  purpose TEXT, -- 질문의 교육적 목적 설명
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE socratic_question_templates DISABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX idx_socratic_questions_module ON socratic_question_templates(module_id);
CREATE INDEX idx_socratic_questions_type ON socratic_question_templates(question_type);

-- 자동 업데이트 트리거
CREATE TRIGGER update_socratic_question_templates_updated_at
  BEFORE UPDATE ON socratic_question_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 (Module 1 예시)
INSERT INTO socratic_question_templates (module_id, question_type, question_text, question_text_en, purpose, order_index) VALUES
-- Module 1: 좋은 질문이 좋은 답을 만든다 (Chain of Thought)
((SELECT id FROM modules WHERE order_index = 1), 'exploration', 
 '교수님께 질문할 때와 AI에게 질문할 때, 어떤 점이 비슷하고 다를까요?',
 'What similarities and differences do you see between asking a question to a professor versus asking AI?',
 '기존 지식 및 경험 확인', 1),
((SELECT id FROM modules WHERE order_index = 1), 'exploration',
 '같은 주제에 대해 모호하게 질문하면 어떤 답을 받을 것 같나요?',
 'What kind of answer do you think you would get if you ask vaguely about the same topic?',
 '프롬프트 품질과 응답 품질의 관계 인식', 2),
((SELECT id FROM modules WHERE order_index = 1), 'clarification',
 'AI에게 질문할 때 무엇이 결과에 영향을 준다고 생각하나요?',
 'What do you think affects the results when asking questions to AI?',
 '프롬프트 구성 요소 인식', 3),
((SELECT id FROM modules WHERE order_index = 1), 'clarification',
 '구체적으로 어떤 정보를 추가하면 더 나은 답변을 받을 수 있을까요?',
 'What specific information could you add to get a better answer?',
 '맥락 정보의 중요성 인식', 4),
((SELECT id FROM modules WHERE order_index = 1), 'assumption',
 '왜 그렇게 생각하나요? 다른 가능성은 없을까요?',
 'Why do you think so? Are there no other possibilities?',
 '가정 점검 및 비판적 사고', 5),
((SELECT id FROM modules WHERE order_index = 1), 'consequence',
 '이 프롬프트로 어떤 결과가 나올 것 같나요?',
 'What results do you expect from this prompt?',
 '예측과 실제 비교를 통한 학습', 6),
((SELECT id FROM modules WHERE order_index = 1), 'reflection',
 '복잡한 문제를 "단계별로" 분석해달라고 하면 왜 더 좋은 답이 나올까요?',
 'Why do you get better answers when you ask to analyze complex problems "step by step"?',
 'Chain of Thought 테크닉 인식 유도', 7),

-- Module 2: 문헌 리뷰 효과적으로 하기 (Few-shot + Output Structuring)
((SELECT id FROM modules WHERE order_index = 2), 'exploration',
 '문헌 리뷰할 때 가장 시간이 오래 걸리는 작업은 무엇인가요?',
 'What takes the most time when doing a literature review?',
 '문제 상황 인식', 1),
((SELECT id FROM modules WHERE order_index = 2), 'exploration',
 'AI가 논문을 요약해준다면, 어떤 정보가 포함되어야 유용할까요?',
 'If AI summarizes papers for you, what information should be included to be useful?',
 '출력 형식의 중요성 인식', 2),
((SELECT id FROM modules WHERE order_index = 2), 'clarification',
 '원하는 형식을 AI에게 어떻게 전달하면 좋을까요?',
 'How should you convey the desired format to AI?',
 '출력 구조화 필요성 인식', 3),
((SELECT id FROM modules WHERE order_index = 2), 'reflection',
 '예시를 하나 보여주는 것이 왜 효과적일까요? 몇 개의 예시가 적절할까요?',
 'Why is showing one example effective? How many examples are appropriate?',
 'Few-shot Learning 테크닉 인식 유도', 4),

-- Module 3: 정책 비교 분석 요청하기 (CoT + Structuring + Self-Consistency)
((SELECT id FROM modules WHERE order_index = 3), 'exploration',
 '좋은 비교 분석에는 어떤 요소가 포함되어야 할까요?',
 'What elements should be included in a good comparative analysis?',
 '분석 프레임워크 인식', 1),
((SELECT id FROM modules WHERE order_index = 3), 'exploration',
 '비교 기준 없이 "비교해줘"라고 하면 어떤 문제가 생길까요?',
 'What problems might arise if you just say "compare" without any criteria?',
 '구조화된 요청의 필요성 인식', 2),
((SELECT id FROM modules WHERE order_index = 3), 'clarification',
 '분석 순서를 명시하면 결과가 어떻게 달라질까요?',
 'How would the results change if you specify the analysis order?',
 '체계적 분석의 가치 인식', 3),
((SELECT id FROM modules WHERE order_index = 3), 'reflection',
 '분석 순서를 미리 알려주는 것과 AI가 알아서 하게 두는 것의 차이는?',
 'What is the difference between specifying the analysis order in advance versus letting AI decide?',
 'Self-Consistency 및 구조화 테크닉 인식 유도', 4),

-- Module 4: 데이터 해석 도움받기 (Persona + CoT + Few-shot)
((SELECT id FROM modules WHERE order_index = 4), 'exploration',
 '데이터를 보여주기만 하면 AI가 당신의 연구 질문을 알 수 있을까요?',
 'Can AI know your research question just by showing the data?',
 '맥락 제공의 중요성 인식', 1),
((SELECT id FROM modules WHERE order_index = 4), 'clarification',
 'AI에게 "전문가" 정체성을 부여하면 어떤 차이가 있을까요?',
 'What difference does it make to give AI an "expert" identity?',
 'Persona 설정의 효과 인식', 2),
((SELECT id FROM modules WHERE order_index = 4), 'assumption',
 '모든 상황에서 전문가 페르소나가 효과적일까요?',
 'Is an expert persona effective in all situations?',
 '테크닉의 적절한 사용 맥락 인식', 3),
((SELECT id FROM modules WHERE order_index = 4), 'reflection',
 'AI에게 전문가 정체성을 부여하면 응답이 어떻게 달라지나요?',
 'How does the response change when you give AI an expert identity?',
 'Persona 테크닉 인식 유도', 4),

-- Module 5: 정책 문서 작성 지원받기 (Persona + Few-shot + Constraints)
((SELECT id FROM modules WHERE order_index = 5), 'exploration',
 '정책 브리핑과 학술 논문의 문체는 어떻게 다른가요?',
 'How does the writing style differ between a policy briefing and an academic paper?',
 '목적에 따른 문체 차이 인식', 1),
((SELECT id FROM modules WHERE order_index = 5), 'exploration',
 '독자가 누구인지 명시하면 AI 응답이 어떻게 달라질까요?',
 'How does specifying the reader change the AI response?',
 '대상 독자 명시의 중요성 인식', 2),
((SELECT id FROM modules WHERE order_index = 5), 'clarification',
 '분량, 톤, 구성 등의 제약조건을 주면 어떤 효과가 있을까요?',
 'What effect does it have to give constraints like length, tone, and structure?',
 'Constraints 테크닉 인식', 3),
((SELECT id FROM modules WHERE order_index = 5), 'reflection',
 '지금까지 배운 방법들 중 가장 효과적이라고 느낀 것은 무엇인가요?',
 'What method have you found most effective among all that you have learned?',
 '종합 학습 성찰', 4);
```

### 3.14 peer_reviews (Phase 3)

```sql
CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES prompt_attempts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  -- scores: {specificity: 1-5, context: 1-5, clarity: 1-5}
  feedback TEXT,
  improvement_suggestions TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, reviewer_id)
);

-- RLS 비활성화 (애플리케이션 레벨에서 권한 관리)
ALTER TABLE peer_reviews DISABLE ROW LEVEL SECURITY;
```

## 4. 함수 및 트리거

### 4.1 updated_at 자동 업데이트

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4.2 새 사용자 프로필 자동 생성

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 4.3 모듈 잠금 해제 확인

```sql
CREATE OR REPLACE FUNCTION check_module_unlock(
  p_user_id UUID,
  p_module_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_id UUID;
  v_prerequisite_completed BOOLEAN;
BEGIN
  SELECT prerequisite_module_id INTO v_prerequisite_id
  FROM modules WHERE id = p_module_id;
  
  IF v_prerequisite_id IS NULL THEN
    RETURN true;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM user_progress
    WHERE user_id = p_user_id
    AND module_id = v_prerequisite_id
    AND status = 'completed'
  ) INTO v_prerequisite_completed;
  
  RETURN v_prerequisite_completed;
END;
$$ LANGUAGE plpgsql;
```

### 4.4 진도율 계산

```sql
CREATE OR REPLACE FUNCTION get_user_progress_stats(p_user_id UUID)
RETURNS TABLE (
  total_modules INTEGER,
  completed_modules INTEGER,
  in_progress_modules INTEGER,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM modules WHERE is_active = true) as total_modules,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as completed_modules,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::INTEGER as in_progress_modules,
    ROUND(
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC /
      NULLIF((SELECT COUNT(*) FROM modules WHERE is_active = true), 0) * 100,
      2
    ) as progress_percentage
  FROM user_progress
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

## 5. 인덱스 전략

```sql
-- 복합 인덱스
CREATE INDEX idx_progress_user_status ON user_progress(user_id, status);
CREATE INDEX idx_attempts_user_created ON prompt_attempts(user_id, created_at DESC);

-- 부분 인덱스
CREATE INDEX idx_active_modules ON modules(order_index) WHERE is_active = true;
CREATE INDEX idx_completed_progress ON user_progress(completed_at) WHERE status = 'completed';

-- JSONB 인덱스
CREATE INDEX idx_dialogue_messages ON dialogues USING GIN (messages);
CREATE INDEX idx_comparison_analysis ON comparisons USING GIN (analysis);
```

## 6. 마이그레이션 순서

1. 기본 함수 생성 (update_updated_at_column)
2. profiles 테이블
3. user_roles 테이블
4. modules 테이블 + 초기 데이터
5. scenarios 테이블
6. socratic_question_templates 테이블 + 초기 데이터
7. user_progress 테이블
8. dialogues 테이블
9. prompt_attempts 테이블
10. comparisons 테이블
11. reflections 테이블
12. technique_badges 테이블
13. resources 테이블 + 초기 데이터
14. peer_reviews 테이블 (Phase 3)
15. 트리거 설정
