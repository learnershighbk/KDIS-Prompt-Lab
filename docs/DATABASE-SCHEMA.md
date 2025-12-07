# Prompt Lab 데이터베이스 스키마

## 1. 개요

Supabase(PostgreSQL)를 사용하며, Row Level Security(RLS)를 적용합니다.

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
└─────────────────┘     │ base_prompt     │
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

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

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

-- RLS 정책
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
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

-- RLS 정책 (모든 인증된 사용자 읽기 가능)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (is_active = true);
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
  base_prompt_example TEXT,
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

-- RLS 정책
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- RLS (user_progress를 통한 간접 접근)
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own dialogues"
  ON dialogues FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = dialogues.progress_id
      AND user_progress.user_id = auth.uid()
    )
  );
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

-- RLS
ALTER TABLE prompt_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own attempts"
  ON prompt_attempts FOR ALL
  USING (auth.uid() = user_id);

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

-- RLS (prompt_attempts를 통한 간접 접근)
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own comparisons"
  ON comparisons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prompt_attempts
      WHERE prompt_attempts.id = comparisons.attempt_id
      AND prompt_attempts.user_id = auth.uid()
    )
  );
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

-- RLS
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own reflections"
  ON reflections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = reflections.progress_id
      AND user_progress.user_id = auth.uid()
    )
  );
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

-- RLS
ALTER TABLE technique_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON technique_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON technique_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3.12 peer_reviews (Phase 3)

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

-- RLS
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews of own attempts"
  ON peer_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompt_attempts
      WHERE prompt_attempts.id = peer_reviews.attempt_id
      AND prompt_attempts.user_id = auth.uid()
    )
    OR reviewer_id = auth.uid()
  );
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
6. user_progress 테이블
7. dialogues 테이블
8. prompt_attempts 테이블
9. comparisons 테이블
10. reflections 테이블
11. technique_badges 테이블
12. peer_reviews 테이블 (Phase 3)
13. 트리거 설정
