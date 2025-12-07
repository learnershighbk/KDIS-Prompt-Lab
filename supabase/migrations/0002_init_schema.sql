-- =====================================================
-- Prompt Lab Database Schema
-- RLS 비활성화: 애플리케이션 레벨에서 권한 관리
-- =====================================================

-- 1. 기본 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Enum 타입 생성
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE step_type AS ENUM ('socratic_dialogue', 'prompt_writing', 'comparison_lab', 'reflection_journal');
CREATE TYPE scenario_category AS ENUM (
  'literature_review',
  'policy_comparison',
  'data_analysis',
  'policy_document',
  'research_design',
  'stakeholder_analysis'
);
CREATE TYPE resource_category AS ENUM ('technique', 'guide', 'video', 'advanced');
CREATE TYPE resource_type AS ENUM ('article', 'video', 'document', 'course');
CREATE TYPE question_type AS ENUM (
  'exploration',
  'clarification',
  'assumption',
  'consequence',
  'reflection'
);

-- 3. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ko' CHECK (preferred_language IN ('ko', 'en')),
  student_id TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. user_roles 테이블
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 5. modules 테이블
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  techniques TEXT[] NOT NULL,
  policy_context TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  prerequisite_module_id UUID REFERENCES modules(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE modules DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. scenarios 테이블
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  category scenario_category NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  context TEXT NOT NULL,
  context_en TEXT,
  base_prompt_example TEXT NOT NULL,
  improved_prompt_example TEXT NOT NULL,
  comparison_criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_scenarios_module ON scenarios(module_id);
CREATE INDEX idx_scenarios_category ON scenarios(category);

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. socratic_question_templates 테이블
CREATE TABLE IF NOT EXISTS socratic_question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question_type question_type NOT NULL,
  question_text TEXT NOT NULL,
  question_text_en TEXT,
  purpose TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE socratic_question_templates DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_socratic_questions_module ON socratic_question_templates(module_id);
CREATE INDEX idx_socratic_questions_type ON socratic_question_templates(question_type);

CREATE TRIGGER update_socratic_question_templates_updated_at
  BEFORE UPDATE ON socratic_question_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. user_progress 테이블
CREATE TABLE IF NOT EXISTS user_progress (
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

ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_module ON user_progress(module_id);
CREATE INDEX idx_progress_status ON user_progress(status);
CREATE INDEX idx_progress_user_status ON user_progress(user_id, status);

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. dialogues 테이블
CREATE TABLE IF NOT EXISTS dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dialogues DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_dialogues_progress ON dialogues(progress_id);
CREATE INDEX idx_dialogue_messages ON dialogues USING GIN (messages);

CREATE TRIGGER update_dialogues_updated_at
  BEFORE UPDATE ON dialogues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. prompt_attempts 테이블
CREATE TABLE IF NOT EXISTS prompt_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES user_progress(id) ON DELETE SET NULL,
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  response_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prompt_attempts DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_attempts_user ON prompt_attempts(user_id);
CREATE INDEX idx_attempts_scenario ON prompt_attempts(scenario_id);
CREATE INDEX idx_attempts_user_created ON prompt_attempts(user_id, created_at DESC);

-- 11. comparisons 테이블
CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES prompt_attempts(id) ON DELETE CASCADE,
  user_response TEXT NOT NULL,
  improved_prompt TEXT NOT NULL,
  improved_response TEXT NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comparisons DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_comparison_analysis ON comparisons USING GIN (analysis);

-- 12. reflections 테이블
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES user_progress(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  insights JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reflections DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 13. technique_badges 테이블
CREATE TABLE IF NOT EXISTS technique_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_name TEXT NOT NULL,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, technique_name)
);

ALTER TABLE technique_badges DISABLE ROW LEVEL SECURITY;

-- 14. resources 테이블
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  category resource_category NOT NULL,
  type resource_type NOT NULL,
  url TEXT NOT NULL,
  techniques TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_type ON resources(type);

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 15. peer_reviews 테이블 (Phase 3)
CREATE TABLE IF NOT EXISTS peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES prompt_attempts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  feedback TEXT,
  improvement_suggestions TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, reviewer_id)
);

ALTER TABLE peer_reviews DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 함수 정의
-- =====================================================

-- 새 사용자 프로필 자동 생성
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

-- 모듈 잠금 해제 확인
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

-- 진도율 계산
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
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END)::INTEGER as completed_modules,
    COUNT(CASE WHEN up.status = 'in_progress' THEN 1 END)::INTEGER as in_progress_modules,
    ROUND(
      COUNT(CASE WHEN up.status = 'completed' THEN 1 END)::NUMERIC /
      NULLIF((SELECT COUNT(*) FROM modules WHERE is_active = true), 0) * 100,
      2
    ) as progress_percentage
  FROM user_progress up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 부분 인덱스
-- =====================================================
CREATE INDEX idx_active_modules ON modules(order_index) WHERE is_active = true;
CREATE INDEX idx_completed_progress ON user_progress(completed_at) WHERE status = 'completed';
