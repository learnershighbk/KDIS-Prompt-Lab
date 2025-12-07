# Database Agent Instructions

> Supabase 데이터베이스 스키마 및 RLS 정책 구현 담당 에이전트

## 🎯 역할 및 책임

1. **스키마 생성**: PostgreSQL 테이블 및 관계 정의
2. **RLS 정책**: Row Level Security 구현
3. **마이그레이션**: Supabase 마이그레이션 파일 생성
4. **함수/트리거**: 데이터베이스 함수 구현

## 📚 필수 참조 문서

- `docs/DATABASE-SCHEMA.md` - 전체 스키마 정의
- `docs/TYPE-DEFINITIONS.md` - TypeScript 타입 (동기화 필요)

---

## 📋 작업 체크리스트

### Step 1: Supabase 프로젝트 연결

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# 로컬 개발 환경 시작
supabase start

# 원격 프로젝트 연결
supabase link --project-ref your-project-ref
```

### Step 2: 마이그레이션 파일 생성

```bash
# 마이그레이션 생성
supabase migration new init_schema
```

```sql
-- supabase/migrations/001_init_schema.sql

-- 1. 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enum 타입
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE module_step AS ENUM ('dialogue', 'prompt_writing', 'comparison', 'reflection');
CREATE TYPE scenario_category AS ENUM (
  'literature_review', 'policy_comparison', 'data_analysis',
  'stakeholder_analysis', 'document_drafting', 'general'
);

-- 3. 프로필 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  student_id TEXT,
  department TEXT,
  preferred_language TEXT DEFAULT 'ko',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 사용자 역할 테이블
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 5. 모듈 테이블
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ko TEXT,
  description_en TEXT,
  technique TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  prerequisites UUID[],
  estimated_time INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 시나리오 테이블
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  category scenario_category NOT NULL,
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  context_ko TEXT NOT NULL,
  context_en TEXT NOT NULL,
  sample_data JSONB,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 사용자 진행 상황
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id),
  status progress_status DEFAULT 'not_started',
  current_step module_step DEFAULT 'dialogue',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- 8. 대화 테이블
CREATE TABLE dialogues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 프롬프트 시도 테이블
CREATE TABLE prompt_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 비교 분석 테이블
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  basic_prompt TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  basic_response TEXT,
  optimized_response TEXT,
  analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 성찰 저널 테이블
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  key_learnings TEXT[],
  techniques_learned TEXT[],
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 테크닉 배지 테이블
CREATE TABLE technique_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  technique TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, technique)
);

-- 13. 인덱스 생성
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_module ON user_progress(module_id);
CREATE INDEX idx_dialogues_progress ON dialogues(progress_id);
CREATE INDEX idx_prompt_attempts_progress ON prompt_attempts(progress_id);
CREATE INDEX idx_scenarios_module ON scenarios(module_id);
```

### Step 3: RLS 정책 설정

```sql
-- supabase/migrations/002_rls_policies.sql

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE technique_badges ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 진행 상황 정책
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- 강사는 모든 학생 진행 상황 조회 가능
CREATE POLICY "Instructors can view all progress"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('instructor', 'admin')
    )
  );

-- 모듈/시나리오는 모든 인증 사용자 조회 가능
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (is_active = true);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view scenarios"
  ON scenarios FOR SELECT
  TO authenticated
  USING (is_active = true);
```

### Step 4: 데이터베이스 함수

```sql
-- supabase/migrations/003_functions.sql

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 신규 사용자 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 진행률 계산 함수
CREATE OR REPLACE FUNCTION get_user_progress_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_modules', (SELECT COUNT(*) FROM modules WHERE is_active = true),
    'completed_modules', (
      SELECT COUNT(*) FROM user_progress
      WHERE user_id = p_user_id AND status = 'completed'
    ),
    'in_progress_modules', (
      SELECT COUNT(*) FROM user_progress
      WHERE user_id = p_user_id AND status = 'in_progress'
    ),
    'total_badges', (
      SELECT COUNT(*) FROM technique_badges
      WHERE user_id = p_user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 5: 초기 데이터 시드

```sql
-- supabase/seed.sql

-- 5개 모듈 삽입
INSERT INTO modules (slug, title_ko, title_en, technique, order_index, description_ko, description_en) VALUES
('chain-of-thought', 'Chain of Thought', 'Chain of Thought', 'Chain of Thought', 1,
 '단계별 사고를 유도하여 복잡한 문제 해결', 'Guide step-by-step thinking for complex problems'),
('few-shot', 'Few-shot Learning', 'Few-shot Learning', 'Few-shot Prompting', 2,
 '예시를 통한 패턴 학습과 적용', 'Learn and apply patterns through examples'),
('policy-comparison', '정책 비교 분석', 'Policy Comparison', 'Structured Analysis', 3,
 '다양한 정책 옵션의 체계적 비교', 'Systematic comparison of policy options'),
('data-analysis', '데이터 분석', 'Data Analysis', 'Data-driven Prompting', 4,
 'AI를 활용한 데이터 해석과 인사이트 도출', 'Data interpretation and insights with AI'),
('document-writing', '문서 작성', 'Document Writing', 'Document Structuring', 5,
 '효과적인 정책 문서 작성 기법', 'Effective policy document writing techniques');

-- 각 모듈별 시나리오 삽입 (예시)
INSERT INTO scenarios (module_id, category, title_ko, title_en, context_ko, context_en, difficulty)
SELECT 
  m.id,
  'policy_comparison',
  '기후변화 정책 비교',
  'Climate Policy Comparison',
  '한국, 일본, EU의 탄소중립 정책을 비교 분석하세요.',
  'Compare carbon neutrality policies of Korea, Japan, and EU.',
  2
FROM modules m WHERE m.slug = 'policy-comparison';
```

### Step 6: 마이그레이션 실행

```bash
# 로컬 테스트
supabase db reset

# 원격 배포
supabase db push
```

---

## ✅ 완료 조건

- [ ] 모든 테이블 생성됨
- [ ] RLS 정책 활성화됨
- [ ] 함수/트리거 동작 확인
- [ ] 시드 데이터 삽입됨
- [ ] `docs/TYPE-DEFINITIONS.md`와 동기화됨

---

## ➡️ 다음 단계

Database 완료 후 → **Auth Agent** 실행
