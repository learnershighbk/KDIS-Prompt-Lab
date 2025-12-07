-- =====================================================
-- MVP 학습 시간 조정
-- 모듈별 10~15분, 단계별 2~3분 학습 목표
-- =====================================================

-- 1. modules 테이블에 예상 학습 시간 컬럼 추가
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 12;

COMMENT ON COLUMN modules.estimated_duration_minutes IS 'MVP 기준 모듈 예상 학습 시간 (분)';

-- 2. 각 모듈의 예상 학습 시간 설정 (10-15분)
UPDATE modules SET estimated_duration_minutes = 10 WHERE order_index = 1; -- Module 1: 입문, 가장 짧게
UPDATE modules SET estimated_duration_minutes = 12 WHERE order_index = 2; -- Module 2
UPDATE modules SET estimated_duration_minutes = 12 WHERE order_index = 3; -- Module 3
UPDATE modules SET estimated_duration_minutes = 12 WHERE order_index = 4; -- Module 4
UPDATE modules SET estimated_duration_minutes = 15 WHERE order_index = 5; -- Module 5: 종합, 가장 길게

-- 3. 기존 소크라틱 질문 비활성화
UPDATE socratic_question_templates SET is_active = false;

-- 4. MVP용 간소화된 소크라틱 질문 삽입 (모듈당 3개, 2-3분 내 완료 가능)
-- Module 1: Chain of Thought (3개 질문)
INSERT INTO socratic_question_templates (module_id, question_type, question_text, question_text_en, purpose, order_index, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'exploration',
 'AI에게 "UBI에 대해 알려줘"라고 물으면 어떤 답이 나올까요?',
 'What answer do you think you would get if you ask AI "Tell me about UBI"?',
 '모호한 질문의 한계 인식', 1, true),
('11111111-1111-1111-1111-111111111111', 'clarification',
 '더 구체적인 답을 얻으려면 어떤 정보를 추가해야 할까요?',
 'What information should you add to get a more specific answer?',
 '구체성의 중요성 인식', 2, true),
('11111111-1111-1111-1111-111111111111', 'reflection',
 '"단계별로 분석해줘"라고 요청하면 왜 더 좋은 답이 나올까요?',
 'Why does asking to "analyze step by step" give better answers?',
 'Chain of Thought 테크닉 핵심 이해', 3, true);

-- Module 2: Few-shot + Output Structuring (3개 질문)
INSERT INTO socratic_question_templates (module_id, question_type, question_text, question_text_en, purpose, order_index, is_active) VALUES
('22222222-2222-2222-2222-222222222222', 'exploration',
 'AI가 논문을 요약해준다면, 어떤 정보가 포함되면 유용할까요?',
 'If AI summarizes papers, what information should be included?',
 '출력 형식의 중요성 인식', 1, true),
('22222222-2222-2222-2222-222222222222', 'clarification',
 '원하는 형식을 AI에게 어떻게 전달하면 좋을까요?',
 'How can you convey the desired format to AI?',
 '출력 구조화 필요성 인식', 2, true),
('22222222-2222-2222-2222-222222222222', 'reflection',
 '예시를 하나 보여주면 왜 AI가 더 정확한 형식으로 답할까요?',
 'Why does showing one example help AI respond in a more accurate format?',
 'Few-shot Learning 핵심 이해', 3, true);

-- Module 3: CoT + Structuring + Self-Consistency (3개 질문)
INSERT INTO socratic_question_templates (module_id, question_type, question_text, question_text_en, purpose, order_index, is_active) VALUES
('33333333-3333-3333-3333-333333333333', 'exploration',
 '"한국이랑 독일 비교해줘"라고만 하면 어떤 문제가 생길까요?',
 'What problems arise if you just say "compare Korea and Germany"?',
 '비교 기준 부재의 문제 인식', 1, true),
('33333333-3333-3333-3333-333333333333', 'clarification',
 '비교 분석에 필요한 기준을 어떻게 명시하면 좋을까요?',
 'How should you specify the criteria for comparative analysis?',
 '구조화된 분석 요청의 가치 인식', 2, true),
('33333333-3333-3333-3333-333333333333', 'reflection',
 '분석 순서를 미리 알려주면 결과가 어떻게 달라질까요?',
 'How does specifying the analysis order change the results?',
 '체계적 분석의 효과 이해', 3, true);

-- Module 4: Persona + CoT + Few-shot (3개 질문)
INSERT INTO socratic_question_templates (module_id, question_type, question_text, question_text_en, purpose, order_index, is_active) VALUES
('44444444-4444-4444-4444-444444444444', 'exploration',
 '데이터만 보여주면 AI가 당신의 연구 맥락을 이해할 수 있을까요?',
 'Can AI understand your research context just by showing data?',
 '맥락 제공의 중요성 인식', 1, true),
('44444444-4444-4444-4444-444444444444', 'clarification',
 '"당신은 개발경제학자입니다"라고 역할을 주면 어떤 차이가 있을까요?',
 'What difference does it make to say "You are a development economist"?',
 'Persona 설정의 효과 인식', 2, true),
('44444444-4444-4444-4444-444444444444', 'reflection',
 '전문가 역할 부여와 해석 예시 제공을 함께 쓰면 왜 더 효과적일까요?',
 'Why is combining expert role and interpretation examples more effective?',
 'Persona + Few-shot 조합 이해', 3, true);

-- Module 5: Persona + Few-shot + Constraints (3개 질문)
INSERT INTO socratic_question_templates (module_id, question_type, question_text, question_text_en, purpose, order_index, is_active) VALUES
('55555555-5555-5555-5555-555555555555', 'exploration',
 '정책 브리핑과 학술 논문은 어떤 점에서 다른가요?',
 'How are policy briefings and academic papers different?',
 '목적별 문체 차이 인식', 1, true),
('55555555-5555-5555-5555-555555555555', 'clarification',
 '독자와 분량 같은 제약조건을 주면 어떤 효과가 있을까요?',
 'What effect do constraints like audience and length have?',
 'Constraints 테크닉 이해', 2, true),
('55555555-5555-5555-5555-555555555555', 'reflection',
 '지금까지 배운 테크닉 중 가장 유용하다고 느낀 것은 무엇인가요?',
 'Which technique have you found most useful so far?',
 '종합 학습 성찰', 3, true);

-- 5. 모듈 설명 MVP용 간소화 (더 짧고 핵심적으로)
UPDATE modules SET 
  description = 'AI에게 좋은 질문을 하면 더 좋은 답을 얻습니다. 단계별 사고 유도법을 배워봅시다.',
  description_en = 'Better questions lead to better AI answers. Learn step-by-step thinking prompts.'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE modules SET 
  description = '논문 요약과 정리에 AI를 활용합니다. 예시와 출력 형식 지정법을 배웁니다.',
  description_en = 'Use AI for paper summaries. Learn examples and output formatting.'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE modules SET 
  description = '정책 비교 분석을 위한 구조화된 질문법을 배웁니다.',
  description_en = 'Learn structured questioning for policy comparison analysis.'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE modules SET 
  description = '통계 해석에 AI를 활용합니다. 전문가 역할 부여법을 배웁니다.',
  description_en = 'Use AI for statistics. Learn expert persona assignment.'
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE modules SET 
  description = '실무 문서 작성에 지금까지 배운 테크닉을 종합 적용합니다.',
  description_en = 'Apply all techniques to practical document writing.'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- 6. 시나리오 프롬프트 예시 간소화 (더 짧고 학습하기 쉽게)
UPDATE scenarios SET 
  base_prompt_example = 'UBI에 대해 알려줘',
  improved_prompt_example = '개발도상국에서 UBI 정책 도입 시 고려할 점을 단계별로 분석해줘: (1) 재정 실현가능성, (2) 기존 복지와의 관계, (3) 정책 제언'
WHERE module_id = '11111111-1111-1111-1111-111111111111';

UPDATE scenarios SET 
  base_prompt_example = '기후변화 농업 논문 요약해줘',
  improved_prompt_example = '아래 형식으로 논문을 요약해줘:\n• 저자/연도: \n• 핵심 발견: \n• 정책 함의: \n\n이 형식으로 기후변화와 동남아 농업정책 논문 3개 정리해줘.'
WHERE module_id = '22222222-2222-2222-2222-222222222222';

UPDATE scenarios SET 
  base_prompt_example = '한국 독일 재생에너지 비교해줘',
  improved_prompt_example = '한국과 독일 재생에너지 정책을 비교해줘:\n1. 각 국가 정책 목표\n2. 정책 수단 비교 (규제, 인센티브)\n3. 한국 관점 시사점'
WHERE module_id = '33333333-3333-3333-3333-333333333333';

UPDATE scenarios SET 
  base_prompt_example = '이 회귀분석 해석해줘 [데이터]',
  improved_prompt_example = '당신은 개발경제학자입니다. 아래 회귀분석 결과를 해석해줘:\n[데이터]\n\n해석 예시: "ODA 계수 0.15는 ODA 1% 증가 시 취학률 0.15%p 상승을 의미"\n\n위 형식으로 각 변수 해석과 정책 함의를 알려줘.'
WHERE module_id = '44444444-4444-4444-4444-444444444444';

UPDATE scenarios SET 
  base_prompt_example = '저출산 정책 브리핑 써줘',
  improved_prompt_example = '독자: KDI 정책연구 부장\n문체 예시: "2023년 출산율 0.72명으로 OECD 최저"\n\n위 스타일로 저출산 정책 브리핑 작성해줘.\n• 분량: 1페이지\n• 구성: 현황 → 주요 정책 → 향후 과제'
WHERE module_id = '55555555-5555-5555-5555-555555555555';

-- 7. learning_step_config 테이블 추가 (단계별 예상 시간)
CREATE TABLE IF NOT EXISTS learning_step_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_type step_type NOT NULL UNIQUE,
  step_name TEXT NOT NULL,
  step_name_en TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 3,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE learning_step_config DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_learning_step_config_updated_at
  BEFORE UPDATE ON learning_step_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 학습 단계 설정 삽입 (각 단계 2-3분)
INSERT INTO learning_step_config (step_type, step_name, step_name_en, estimated_minutes, description, order_index) VALUES
('socratic_dialogue', '개념 탐색', 'Concept Exploration', 3, '소크라틱 대화를 통해 핵심 개념을 탐색합니다', 1),
('prompt_writing', '프롬프트 작성', 'Prompt Writing', 3, '배운 테크닉을 적용하여 프롬프트를 작성합니다', 2),
('comparison_lab', '비교 실험', 'Comparison Lab', 3, '기본 프롬프트와 개선된 프롬프트의 결과를 비교합니다', 3),
('reflection_journal', '성찰 기록', 'Reflection Journal', 2, '학습 내용을 정리하고 인사이트를 기록합니다', 4)
ON CONFLICT (step_type) DO UPDATE SET
  estimated_minutes = EXCLUDED.estimated_minutes,
  description = EXCLUDED.description;

COMMENT ON TABLE learning_step_config IS 'MVP 학습 단계별 설정 (각 단계 2-3분 목표)';

