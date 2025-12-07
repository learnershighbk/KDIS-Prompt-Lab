claude "
# Prompt Lab 프로젝트 전체 구현

## 참조 문서
- docs/PRD.md - 전체 요구사항
- docs/ARCHITECTURE.md - 시스템 아키텍처
- docs/DATABASE-SCHEMA.md - 데이터베이스 스키마
- docs/API-SPEC.md - API 명세
- docs/COMPONENT-STRUCTURE.md - 컴포넌트 구조
- docs/STATE-MANAGEMENT.md - 상태 관리
- docs/PROJECT-STRUCTURE.md - 프로젝트 구조

## 작업 순서

### Phase 1: Foundation
claude/agents/FOUNDATION-AGENT.md 지침에 따라:
- 폴더 구조 생성 (src/features/, src/backend/, src/components/ 등)
- 필수 의존성 설치 (@supabase/supabase-js, @supabase/ssr, zustand, @tanstack/react-query, zod, hono 등)
- Tailwind KDI 브랜드 컬러 설정 (primary-500: #003366, accent-500: #C9A227)
- 환경 변수 템플릿 생성

### Phase 2: Database
claude/agents/DATABASE-AGENT.md 지침에 따라:
- supabase/migrations/ 폴더에 마이그레이션 파일 생성
- profiles, user_roles, modules, scenarios, user_progress, dialogues, prompt_attempts, comparisons, reflections, technique_badges 테이블 생성
- RLS 비활성화
- updated_at 트리거 적용

### Phase 3: Auth
claude/agents/AUTH-AGENT.md 지침에 따라:
- src/infrastructure/supabase/ 클라이언트 설정
- src/stores/authStore.ts 구현
- src/components/features/auth/ 컴포넌트 구현

### Phase 4: API
claude/agents/API-AGENT.md 지침에 따라 (.ruler/AGENTS.md Backend Layer 규칙 필수):
- src/backend/hono/app.ts, context.ts 설정
- src/features/auth/backend/ 라우트 및 서비스
- src/features/modules/backend/ 라우트 및 서비스
- src/features/dialogues/backend/ 라우트 및 서비스
- src/features/ai/backend/ 스트리밍 API

### Phase 5: UI
claude/agents/UI-AGENT.md 지침에 따라:
- src/components/layouts/ 레이아웃 컴포넌트
- src/components/features/modules/ 모듈 관련 컴포넌트
- src/components/features/dialogue/ 대화 UI 컴포넌트
- src/components/features/comparison/ 비교 분석 컴포넌트
- src/components/features/reflection/ 성찰 저널 컴포넌트
- src/app/ 페이지 구현

## 필수 규칙
- 모든 컴포넌트에 'use client' 디렉티브 사용
- Hono 라우트는 반드시 /api prefix 포함
- logger.info() 사용 (logger.log() 금지)
- API 응답 스키마에서 redirectTo는 z.string() 사용 (z.string().url() 금지)
"