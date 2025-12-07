# Orchestrator Agent Instructions

> 전체 에이전트 조율 및 통합 관리를 담당하는 총괄 에이전트

## 🎯 역할 및 책임

이 에이전트는 Prompt Lab 프로젝트의 **총괄 조율자**로서 다음을 담당합니다:

1. **에이전트 작업 조율**: 5개 전문 에이전트의 작업 순서 및 의존성 관리
2. **통합 테스트**: 각 에이전트 산출물의 통합 검증
3. **충돌 해결**: 에이전트 간 코드/설계 충돌 조정
4. **진행 상황 추적**: 전체 프로젝트 진척도 모니터링

---

## 📋 에이전트 구성 및 의존성

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│                    (총괄 조율 에이전트)                        │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  FOUNDATION     │  │   DATABASE      │  │     AUTH        │
│    AGENT        │──▶│    AGENT        │──▶│    AGENT        │
│  (Phase 1)      │  │  (Phase 1-2)    │  │  (Phase 2)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│      API        │                     │       UI        │
│    AGENT        │◀───────────────────▶│     AGENT       │
│  (Phase 2-3)    │                     │  (Phase 2-3)    │
└─────────────────┘                     └─────────────────┘
```

---

## 🔄 작업 실행 순서

### Phase 1: 기초 설정 (Day 1-2)

```bash
# Step 1: Foundation Agent 실행
claude-code "Foundation Agent: SuperNext 템플릿 초기화 및 프로젝트 구조 설정"

# Step 2: Database Agent 실행 (Foundation 완료 후)
claude-code "Database Agent: Supabase 스키마 및 마이그레이션 생성"
```

**완료 체크리스트:**
- [ ] SuperNext 템플릿 클론 및 의존성 설치
- [ ] 환경 변수 설정 (.env.local)
- [ ] Cursor Ruler 설정 (.cursor/rules/)
- [ ] Supabase 프로젝트 연결
- [ ] 데이터베이스 마이그레이션 실행

### Phase 2: 핵심 기능 (Day 3-7)

```bash
# Step 3: Auth Agent 실행 (Database 완료 후)
claude-code "Auth Agent: Supabase Auth 및 역할 기반 인증 구현"

# Step 4: API Agent 실행 (Auth와 병렬 가능)
claude-code "API Agent: RESTful API 라우트 구현"

# Step 5: UI Agent 실행 (API와 병렬 가능)
claude-code "UI Agent: 핵심 컴포넌트 및 페이지 구현"
```

**완료 체크리스트:**
- [ ] 로그인/회원가입 플로우 동작
- [ ] API 엔드포인트 테스트 통과
- [ ] 모듈 목록 및 상세 페이지 렌더링
- [ ] Socratic Dialogue 기본 동작

### Phase 3: 통합 및 테스트 (Day 8-10)

```bash
# Step 6: 통합 테스트
claude-code "Orchestrator: 전체 시스템 통합 테스트 및 버그 수정"
```

**완료 체크리스트:**
- [ ] 전체 학습 플로우 E2E 테스트
- [ ] AI 응답 스트리밍 동작 확인
- [ ] 비교 분석 및 성찰 저널 동작
- [ ] 배지 시스템 동작

---

## 📁 참조 문서

각 에이전트는 다음 문서들을 참조해야 합니다:

| 에이전트 | 필수 참조 문서 |
|---------|--------------|
| Foundation | `TECH-STACK.md`, `PROJECT-STRUCTURE.md` |
| Database | `DATABASE-SCHEMA.md`, `TYPE-DEFINITIONS.md` |
| Auth | `API-SPEC.md`, `STATE-MANAGEMENT.md` |
| API | `API-SPEC.md`, `TYPE-DEFINITIONS.md`, `ARCHITECTURE.md` |
| UI | `COMPONENT-STRUCTURE.md`, `STATE-MANAGEMENT.md` |
| Orchestrator | 모든 문서 |

---

## 🔍 통합 검증 스크립트

### 의존성 체크

```bash
#!/bin/bash
# check-dependencies.sh

echo "=== Prompt Lab Integration Check ==="

# 1. 환경 변수 확인
check_env() {
  local vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "ANTHROPIC_API_KEY")
  for var in "${vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "❌ Missing: $var"
      return 1
    fi
  done
  echo "✅ Environment variables OK"
}

# 2. Supabase 연결 확인
check_supabase() {
  npx supabase db ping && echo "✅ Supabase connection OK" || echo "❌ Supabase connection failed"
}

# 3. 빌드 테스트
check_build() {
  npm run build && echo "✅ Build OK" || echo "❌ Build failed"
}

# 4. 타입 체크
check_types() {
  npm run type-check && echo "✅ TypeScript OK" || echo "❌ TypeScript errors"
}

check_env
check_supabase
check_types
check_build
```

### API 통합 테스트

```typescript
// tests/integration/api.test.ts
import { describe, it, expect } from 'vitest';

describe('API Integration', () => {
  it('should authenticate user', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@kdi.ac.kr', password: 'test1234' }),
    });
    expect(res.status).toBe(200);
  });

  it('should fetch modules', async () => {
    const res = await fetch('/api/modules');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.length).toBe(5);
  });

  it('should stream dialogue', async () => {
    const res = await fetch('/api/ai/stream/dialogue', {
      method: 'POST',
      body: JSON.stringify({ progressId: 'test-id', message: 'Hello' }),
    });
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });
});
```

---

## 🚨 에이전트 간 충돌 해결

### 타입 불일치

```typescript
// 해결: TYPE-DEFINITIONS.md를 Single Source of Truth로 사용
// 모든 에이전트는 src/types/에 정의된 타입만 사용

// ❌ 잘못된 예: 에이전트별 독자 타입 정의
interface MyModule { ... }

// ✅ 올바른 예: 공유 타입 import
import type { Module } from '@/types';
```

### API 경로 충돌

```typescript
// 해결: API-SPEC.md의 경로 규칙 준수
// /api/{resource}/{action}

// ❌ 잘못된 예
/api/getModules
/api/module/fetch

// ✅ 올바른 예
/api/modules
/api/modules/:id
```

### 상태 관리 충돌

```typescript
// 해결: STATE-MANAGEMENT.md 규칙 준수
// - 서버 상태: React Query
// - 클라이언트 상태: Zustand

// ❌ 잘못된 예: useState로 서버 데이터 관리
const [modules, setModules] = useState([]);
useEffect(() => { fetchModules().then(setModules); }, []);

// ✅ 올바른 예: React Query 사용
const { data: modules } = useModules();
```

---

## 📊 진행 상황 추적

### 에이전트 상태 대시보드

```markdown
## Prompt Lab Development Status

### Phase 1: Foundation
| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| SuperNext 초기화 | Foundation | ⬜ | |
| 환경 변수 설정 | Foundation | ⬜ | |
| Cursor Ruler | Foundation | ⬜ | |
| DB 스키마 생성 | Database | ⬜ | |
| RLS 정책 적용 | Database | ⬜ | |

### Phase 2: Core Features
| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| Auth 구현 | Auth | ⬜ | |
| 모듈 API | API | ⬜ | |
| 대화 API | API | ⬜ | |
| 모듈 페이지 | UI | ⬜ | |
| 대화 UI | UI | ⬜ | |

### Phase 3: Integration
| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| E2E 테스트 | Orchestrator | ⬜ | |
| 버그 수정 | All | ⬜ | |
| 배포 준비 | Foundation | ⬜ | |

Legend: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked
```

---

## 🛠️ Claude Code 명령어 템플릿

### 에이전트 실행 명령

```bash
# Foundation Agent
claude "docs/TECH-STACK.md와 docs/PROJECT-STRUCTURE.md를 참조하여 SuperNext 템플릿을 초기화하고 프로젝트 구조를 설정하세요. claude/agents/FOUNDATION-AGENT.md의 지침을 따르세요."

# Database Agent
claude "docs/DATABASE-SCHEMA.md를 참조하여 Supabase 마이그레이션 파일을 생성하고 RLS 정책을 적용하세요. claude/agents/DATABASE-AGENT.md의 지침을 따르세요."

# Auth Agent
claude "docs/API-SPEC.md와 docs/STATE-MANAGEMENT.md를 참조하여 Supabase Auth 기반 인증 시스템을 구현하세요. claude/agents/AUTH-AGENT.md의 지침을 따르세요."

# API Agent
claude "docs/API-SPEC.md와 docs/TYPE-DEFINITIONS.md를 참조하여 RESTful API 라우트를 구현하세요. claude/agents/API-AGENT.md의 지침을 따르세요."

# UI Agent
claude "docs/COMPONENT-STRUCTURE.md와 docs/STATE-MANAGEMENT.md를 참조하여 UI 컴포넌트와 페이지를 구현하세요. claude/agents/UI-AGENT.md의 지침을 따르세요."
```

### 통합 테스트 명령

```bash
# 전체 통합 테스트
claude "모든 에이전트의 작업이 완료되었습니다. 전체 시스템의 통합 테스트를 수행하고 발견된 문제를 수정하세요."

# 특정 기능 테스트
claude "Socratic Dialogue 기능의 E2E 테스트를 수행하세요. 대화 시작부터 완료까지 전체 플로우를 검증하세요."
```

---

## ⚠️ 주의사항

1. **순서 준수**: Phase 1 완료 전 Phase 2 시작 금지
2. **문서 우선**: 모든 구현은 docs/ 문서 기준
3. **타입 안전**: TypeScript strict 모드 위반 금지
4. **테스트 필수**: 각 에이전트는 단위 테스트 포함

---

## 📞 에스컬레이션

다음 상황 발생 시 Orchestrator에게 보고:

- 에이전트 간 의존성 충돌
- 문서와 구현 간 불일치
- 빌드 또는 타입 오류 해결 불가
- 성능 또는 보안 이슈 발견
