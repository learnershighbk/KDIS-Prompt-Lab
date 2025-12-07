# Prompt Lab 기술 문서 검토 보고서

> **검토일**: 2025년 12월 7일  
> **검토 대상**: docs/, prompts/, claude/agents/ 내 모든 문서  
> **기준 문서**: PRD.md

---

## 1. 전체 구조 평가

문서 체계가 전반적으로 **잘 구성**되어 있습니다:

- PRD ↔ 기술 문서 ↔ AI 프롬프트 ↔ 에이전트 지침이 체계적으로 연결됨
- 피처 기반 모듈 구조가 일관성 있게 정의됨
- Hono + Next.js 백엔드 패턴이 명확하게 문서화됨

### 문서 구성

| 구분 | 파일 | 상태 |
|------|------|------|
| 요구사항 | PRD.md | ✅ 완성 |
| 아키텍처 | ARCHITECTURE.md | ✅ 완성 |
| DB 스키마 | DATABASE-SCHEMA.md | ✅ 완성 |
| API 스펙 | API-SPEC.md | ⚠️ 수정필요 |
| 기술 스택 | TECH-STACK.md | ✅ 완성 |
| 프로젝트 구조 | PROJECT-STRUCTURE.md | ⚠️ 수정필요 |
| 컴포넌트 구조 | COMPONENT-STRUCTURE.md | ✅ 완성 |
| 상태 관리 | STATE-MANAGEMENT.md | ✅ 완성 |
| 타입 정의 | TYPE-DEFINITIONS.md | ⚠️ 수정필요 |
| AI 프롬프트 | prompts/*.md | ✅ 완성 |
| 에이전트 지침 | claude/agents/*.md | ⚠️ 수정필요 |

---

## 2. 상충 및 불일치 사항

### 2.1 API 경로 버전 불일치 (Critical)

| 문서 | API 경로 패턴 |
|------|--------------|
| **API-SPEC.md** | `/api/auth/register`, `/api/modules` |
| **ORCHESTRATOR-AGENT.md** | `/api/v1/auth/login`, `/api/v1/modules` |
| **AGENTS.md (규칙)** | `/api/auth/signup` (예시) |

**문제점**: API 버전 관리 방식이 문서마다 다름

**해결 방안**: 
- `/api/` 패턴으로 통일 (v1 제거)
- 현재 코드베이스의 Hono 설정(`/api/[[...hono]]`)과 일치시킴
- 향후 버전 관리가 필요하면 헤더 기반 버전닝 사용

**수정 대상 파일**:
- `claude/agents/ORCHESTRATOR-AGENT.md`: `/api/v1/*` → `/api/*`

---

### 2.2 환경 변수 불일치 (Critical)

| 문서 | AI Provider 환경 변수 |
|------|----------------------|
| **PRD.md** | Anthropic Claude API |
| **TECH-STACK.md** | `ANTHROPIC_API_KEY` |
| **PROJECT-STRUCTURE.md** | `ANTHROPIC_API_KEY` |
| **ORCHESTRATOR-AGENT.md** | `OPENAI_API_KEY` ❌ |

**문제점**: ORCHESTRATOR-AGENT.md의 통합 검증 스크립트가 잘못된 환경 변수 확인

**해결 방안**: ORCHESTRATOR-AGENT.md 수정

```bash
# Before (line 126)
local vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "OPENAI_API_KEY")

# After  
local vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "ANTHROPIC_API_KEY")
```

**수정 대상 파일**:
- `claude/agents/ORCHESTRATOR-AGENT.md`

---

### 2.3 피처 디렉토리 이름 불일치 (Medium)

| 문서 | 대화 피처 이름 |
|------|---------------|
| **ARCHITECTURE.md** | `src/features/dialogue/` |
| **PROJECT-STRUCTURE.md** | `src/features/socratic-dialogue/` |
| **COMPONENT-STRUCTURE.md** | `src/features/socratic-dialogue/` |

**문제점**: 동일한 기능에 대해 다른 디렉토리 이름 사용

**해결 방안**: `src/features/dialogue/`로 통일 (간결성, ARCHITECTURE.md 기준)

**수정 대상 파일**:
- `docs/PROJECT-STRUCTURE.md`: `socratic-dialogue` → `dialogue`
- `docs/COMPONENT-STRUCTURE.md`: `socratic-dialogue` → `dialogue`

---

### 2.4 도메인 엔티티 경로 불일치 (Medium)

| 문서 | 타입 경로 |
|------|----------|
| **TYPE-DEFINITIONS.md** | `src/domain/entities/*.entity.ts` |
| **AGENTS.md (규칙)** | `src/features/[feature]/backend/schema.ts` |
| **실제 프로젝트 구조** | `src/domain/` 디렉토리 없음 |

**문제점**: TYPE-DEFINITIONS.md가 존재하지 않는 경로 참조

**해결 방안**:

| Option | 설명 | 권장 |
|--------|------|------|
| A | `src/types/`에 모든 공유 타입 정의 | ✅ 권장 |
| B | `src/domain/entities/` 생성 (TYPE-DEFINITIONS.md 기준) | |

→ **Option A 권장**: 
- AGENTS.md 규칙에 맞춰 `src/features/[feature]/backend/schema.ts`에서 Zod 스키마 정의
- 공유 타입은 `src/types/`에 위치
- TYPE-DEFINITIONS.md의 경로 수정 필요

**수정 대상 파일**:
- `docs/TYPE-DEFINITIONS.md`: `src/domain/entities/` → `src/types/`

---

### 2.5 인증 API 경로 명명 (Low)

| 문서 | 회원가입 경로 |
|------|--------------|
| **API-SPEC.md** | `POST /api/auth/register` |
| **AGENTS.md 예시** | `/api/auth/signup` |

**해결 방안**: `/api/auth/signup`으로 통일 (더 일반적인 명명)

**수정 대상 파일**:
- `docs/API-SPEC.md`: `/api/auth/register` → `/api/auth/signup`

---

## 3. 중복 사항

### 3.1 AGENTS.md 중복

현재 상태:
- `AGENTS.md` (루트) - 존재
- `.ruler/AGENTS.md` - 존재 (workspace rules에서 참조)
- `CLAUDE.md` - `.ruler/AGENTS.md` 내용 참조

**문제점**: 동일한 규칙이 여러 파일에 중복 정의

**해결 방안**: 
- `.ruler/AGENTS.md`를 **Single Source of Truth**로 유지
- 루트 `AGENTS.md`는 `.ruler/AGENTS.md` 참조 링크만 포함
- `CLAUDE.md`는 현재 상태 유지 (Cursor에서 자동 생성)

---

## 4. 누락 사항

### 4.1 구현 세부사항 누락

| 항목 | 상태 | 설명 |
|------|------|------|
| Rate Limiting | ❌ 누락 | API-SPEC.md에 정의되었지만 미들웨어 구현 가이드 없음 |
| AI 프롬프트 통합 | ❌ 누락 | prompts/*.md를 코드에서 로드하는 방법 미정의 |
| 다국어 (next-intl) | ❌ 누락 | TECH-STACK.md에 언급되었지만 구현 가이드 없음 |
| SSE 스트리밍 | ❌ 누락 | Hono에서의 구현 패턴 미정의 |
| 에러 코드 체계 | ⚠️ 부분 | 피처별 error.ts 가이드라인 필요 |

### 4.2 필요한 shadcn 컴포넌트

현재 설치된 컴포넌트와 추가 필요 컴포넌트:

| 컴포넌트 | 현재 상태 | 용도 |
|----------|----------|------|
| accordion | ✅ 설치됨 | FAQ, 리소스 목록 |
| avatar | ✅ 설치됨 | 사용자/튜터 아바타 |
| badge | ✅ 설치됨 | 테크닉 배지 |
| button | ✅ 설치됨 | 기본 버튼 |
| card | ✅ 설치됨 | 모듈 카드 |
| checkbox | ✅ 설치됨 | 체크리스트 |
| dropdown-menu | ✅ 설치됨 | 네비게이션 |
| form | ✅ 설치됨 | 폼 처리 |
| input | ✅ 설치됨 | 입력 필드 |
| label | ✅ 설치됨 | 레이블 |
| select | ✅ 설치됨 | 선택 |
| separator | ✅ 설치됨 | 구분선 |
| sheet | ✅ 설치됨 | 모바일 메뉴 |
| textarea | ✅ 설치됨 | 텍스트 입력 |
| toast/toaster | ✅ 설치됨 | 알림 |
| progress | ❌ 필요 | 진도 표시 |
| tabs | ❌ 필요 | 모듈 내 스텝 전환 |
| skeleton | ❌ 필요 | 로딩 상태 |
| alert | ❌ 필요 | 피드백 메시지 |
| scroll-area | ❌ 필요 | 대화 스크롤 |
| tooltip | ❌ 필요 | 배지/테크닉 설명 |
| dialog | ❌ 필요 | 모달 다이얼로그 |

**설치 명령어**:
```bash
npx shadcn@latest add progress tabs skeleton alert scroll-area tooltip dialog
```

---

## 5. 데이터베이스 스키마 검토

### 5.1 PRD vs DATABASE-SCHEMA.md 비교

| PRD 테이블 | DATABASE-SCHEMA.md | 상태 |
|-----------|-------------------|------|
| profiles | ✅ 정의됨 | 일치 |
| user_roles | ✅ 정의됨 | 일치 |
| modules | ✅ 정의됨 | 일치 |
| scenarios | ✅ 정의됨 | 일치 |
| user_progress | ✅ 정의됨 | 일치 |
| dialogues | ✅ 정의됨 | 일치 |
| prompt_attempts | ✅ 정의됨 | 일치 |
| comparisons | ✅ 정의됨 | 일치 |
| reflections | ✅ 정의됨 | 일치 |
| technique_badges | ✅ 정의됨 | 일치 |
| resources | ✅ 추가됨 | PRD 4.6절 반영 |
| socratic_question_templates | ✅ 추가됨 | PRD 4.1절 반영 |
| peer_reviews | ✅ 정의됨 | Phase 3 |

**결론**: 데이터베이스 스키마는 PRD와 완전히 일치하며 잘 정의되어 있음.

### 5.2 마이그레이션 파일 생성 순서

현재 `supabase/migrations/`에는 예시 파일(`0001_create_example_table.sql`)만 존재.
DATABASE-SCHEMA.md 기준으로 다음 순서로 생성 필요:

```
0002_create_update_function.sql      # update_updated_at_column 함수
0003_create_profiles.sql             # profiles 테이블 + 트리거
0004_create_user_roles.sql           # user_roles 테이블 + enum
0005_create_modules_with_seed.sql    # modules 테이블 + 초기 데이터
0006_create_scenarios.sql            # scenarios 테이블 + enum
0007_create_socratic_templates.sql   # socratic_question_templates + 초기 데이터
0008_create_user_progress.sql        # user_progress 테이블 + enum
0009_create_dialogues.sql            # dialogues 테이블
0010_create_prompt_attempts.sql      # prompt_attempts 테이블
0011_create_comparisons.sql          # comparisons 테이블
0012_create_reflections.sql          # reflections 테이블
0013_create_technique_badges.sql     # technique_badges 테이블
0014_create_resources_with_seed.sql  # resources 테이블 + 초기 데이터
0015_create_peer_reviews.sql         # peer_reviews 테이블 (Phase 3)
0016_create_indexes.sql              # 인덱스 생성
0017_create_auth_trigger.sql         # 신규 사용자 트리거
```

---

## 6. 기술적 권장사항

### 6.1 즉시 수정 필요 (구현 전 필수)

- [ ] `claude/agents/ORCHESTRATOR-AGENT.md`: `OPENAI_API_KEY` → `ANTHROPIC_API_KEY`
- [ ] `claude/agents/ORCHESTRATOR-AGENT.md`: `/api/v1/*` → `/api/*`
- [ ] `docs/PROJECT-STRUCTURE.md`: `socratic-dialogue` → `dialogue`
- [ ] `docs/COMPONENT-STRUCTURE.md`: `socratic-dialogue` → `dialogue`
- [ ] `docs/TYPE-DEFINITIONS.md`: `src/domain/entities/` → `src/types/`
- [ ] `docs/API-SPEC.md`: `/api/auth/register` → `/api/auth/signup`

### 6.2 AI 프롬프트 통합 권장 구조

```
src/
└── lib/
    └── ai/
        ├── prompts/
        │   ├── socratic-tutor.ts     # prompts/SOCRATIC-TUTOR.md 내용
        │   ├── comparison-engine.ts  # prompts/COMPARISON-ENGINE.md 내용
        │   ├── prompt-analyzer.ts    # prompts/PROMPT-ANALYZER.md 내용
        │   └── reflection-guide.ts   # prompts/REFLECTION-GUIDE.md 내용
        ├── anthropic-client.ts       # Claude API 클라이언트
        └── stream-utils.ts           # SSE 스트리밍 유틸
```

### 6.3 Rate Limiting 구현 제안

```typescript
// src/backend/middleware/rate-limit.ts
import { Context, Next } from 'hono';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  auth: { windowMs: 60000, max: 10 },      // 1분에 10회
  ai: { windowMs: 60000, max: 30 },        // 1분에 30회
  general: { windowMs: 60000, max: 100 },  // 1분에 100회
};

export const withRateLimit = (category: keyof typeof rateLimitConfigs) => {
  return async (c: Context, next: Next) => {
    // 구현 필요
    await next();
  };
};
```

---

## 7. 결론

### 종합 평가

| 영역 | 상태 | 비고 |
|------|------|------|
| PRD 완성도 | ✅ 우수 | 모든 기능 상세 정의 |
| 기술 스택 | ✅ 적합 | Next.js 15 + Hono + Supabase |
| DB 스키마 | ✅ 완성 | PRD와 일치 |
| API 스펙 | ⚠️ 수정필요 | 경로 버전/명명 통일 필요 |
| 컴포넌트 구조 | ✅ 상세 | 피처 기반 잘 정의 |
| 상태 관리 | ✅ 명확 | Zustand + React Query |
| AI 프롬프트 | ✅ 준비됨 | 코드 통합만 필요 |
| 에이전트 지침 | ⚠️ 수정필요 | 환경변수/경로 통일 필요 |

### 구현 준비도

**전체 준비도**: **85%**

- 문서 체계: 95%
- 스키마 정의: 100%
- API 설계: 90%
- 컴포넌트 설계: 90%
- 인프라 설정: 80%

### 권장 다음 단계

1. **문서 수정** (30분)
   - 위 6.1절의 6개 항목 수정

2. **shadcn 컴포넌트 추가** (5분)
   ```bash
   npx shadcn@latest add progress tabs skeleton alert scroll-area tooltip dialog
   ```

3. **마이그레이션 파일 생성** (1시간)
   - DATABASE-SCHEMA.md 기준으로 SQL 파일 생성

4. **구현 시작**
   - Phase 1: 기초 설정 및 인증
   - Phase 2: 핵심 기능 (모듈, 대화, 비교)
   - Phase 3: 부가 기능 (교수자, 동료평가)

---

**문서 버전**: 1.0  
**최종 수정일**: 2025년 12월 7일  
**작성자**: AI Assistant

