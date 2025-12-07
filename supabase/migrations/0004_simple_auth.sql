-- =====================================================
-- 간편 로그인을 위한 스키마 변경
-- 학번(9자리) + PIN(4자리) 방식
-- 주의: 0002_init_schema.sql이 먼저 실행되어야 합니다!
-- =====================================================

-- profiles 테이블 존재 여부 확인 후 실행
DO $$
BEGIN
  -- profiles 테이블이 존재하는지 확인
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    RAISE EXCEPTION 'profiles 테이블이 존재하지 않습니다. 0002_init_schema.sql을 먼저 실행해주세요.';
  END IF;

  -- 기존 트리거 삭제
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP FUNCTION IF EXISTS handle_new_user();
END $$;

-- 새로운 사용자 생성 트리거 (학번 저장 포함)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id TEXT;
BEGIN
  -- 이메일에서 학번 추출 (format: {학번}@promptlab.app)
  v_student_id := split_part(NEW.email, '@', 1);
  
  INSERT INTO profiles (id, full_name, student_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    v_student_id
  )
  ON CONFLICT (id) DO UPDATE SET
    student_id = COALESCE(EXCLUDED.student_id, profiles.student_id),
    updated_at = NOW();

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- profiles 테이블에 student_id 인덱스 추가 (빠른 조회용)
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
