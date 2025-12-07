# Prompt Lab 프로젝트 구조

## 1. 전체 디렉토리 구조

```
prompt-lab/
├── .cursor/                      # Cursor AI 설정
│   └── rules/                    # Ruler 규칙 파일
├── claude/                       # Claude Code 에이전트 설정
│   └── agents/                   # 에이전트별 지침
├── docs/                         # 프로젝트 문서
├── prompts/                      # AI 시스템 프롬프트
├── public/                       # 정적 파일
│   ├── images/
│   └── locales/                  # i18n 번역 파일
├── src/
│   ├── app/                      # Next.js App Router
│   ├── components/               # React 컴포넌트
│   ├── domain/                   # 도메인 레이어
│   ├── hooks/                    # Custom React Hooks
│   ├── infrastructure/           # 인프라 레이어
│   ├── lib/                      # 유틸리티 라이브러리
│   ├── services/                 # 애플리케이션 서비스
│   ├── stores/                   # Zustand 상태 관리
│   ├── styles/                   # 전역 스타일
│   └── types/                    # TypeScript 타입 정의
├── supabase/                     # Supabase 설정
│   ├── migrations/               # DB 마이그레이션
│   └── seed.sql                  # 초기 데이터
├── tests/                        # 테스트 파일
├── .env.local                    # 환경 변수 (로컬)
├── .env.example                  # 환경 변수 예시
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json
```

## 2. App Router 구조 (src/app/)

```
src/app/
├── (auth)/                       # 인증 라우트 그룹
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── layout.tsx                # 인증 페이지 공통 레이아웃
│
├── (dashboard)/                  # 대시보드 라우트 그룹 (인증 필요)
│   ├── layout.tsx                # 대시보드 공통 레이아웃
│   ├── page.tsx                  # 메인 대시보드 (/)
│   │
│   ├── modules/
│   │   ├── page.tsx              # 모듈 목록 (/modules)
│   │   └── [moduleId]/
│   │       ├── page.tsx          # 모듈 상세 (/modules/[id])
│   │       └── [step]/
│   │           └── page.tsx      # 학습 스텝 (/modules/[id]/[step])
│   │
│   ├── journal/
│   │   ├── page.tsx              # 성찰 저널 목록 (/journal)
│   │   └── [reflectionId]/
│   │       └── page.tsx          # 저널 상세 (/journal/[id])
│   │
│   ├── resources/
│   │   └── page.tsx              # 학습 리소스 (/resources)
│   │
│   ├── profile/
│   │   └── page.tsx              # 프로필 설정 (/profile)
│   │
│   └── progress/
│       └── page.tsx              # 진도 상세 (/progress)
│
├── (instructor)/                 # 교수자 라우트 그룹
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx              # 교수자 대시보드
│   ├── students/
│   │   └── page.tsx              # 학생 관리
│   └── scenarios/
│       ├── page.tsx              # 시나리오 목록
│       └── [scenarioId]/
│           └── page.tsx          # 시나리오 편집
│
├── api/                          # API Routes
│   └── v1/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── refresh/route.ts
│       ├── modules/
│       │   ├── route.ts          # GET /modules
│       │   └── [moduleId]/
│       │       ├── route.ts      # GET /modules/[id]
│       │       └── start/route.ts
│       ├── dialogues/
│       │   ├── route.ts          # POST /dialogues
│       │   └── [dialogueId]/
│       │       ├── route.ts      # GET /dialogues/[id]
│       │       └── messages/route.ts
│       ├── prompts/
│       │   ├── submit/route.ts
│       │   └── attempts/route.ts
│       ├── comparisons/
│       │   └── route.ts
│       ├── reflections/
│       │   └── route.ts
│       ├── progress/
│       │   ├── route.ts
│       │   └── [progressId]/
│       │       └── complete-step/route.ts
│       ├── ai/
│       │   └── stream/
│       │       ├── dialogue/route.ts
│       │       └── prompt/route.ts
│       └── instructor/
│           ├── students/route.ts
│           └── scenarios/route.ts
│
├── globals.css                   # 전역 CSS
├── layout.tsx                    # 루트 레이아웃
├── loading.tsx                   # 전역 로딩 UI
├── error.tsx                     # 전역 에러 UI
└── not-found.tsx                 # 404 페이지
```

## 3. Components 구조 (src/components/)

```
src/components/
├── ui/                           # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── progress.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── tooltip.tsx
│   └── ...
│
├── layouts/                      # 레이아웃 컴포넌트
│   ├── header.tsx                # 공통 헤더
│   ├── sidebar.tsx               # 사이드바
│   ├── footer.tsx                # 푸터
│   ├── dashboard-layout.tsx      # 대시보드 레이아웃
│   └── auth-layout.tsx           # 인증 페이지 레이아웃
│
├── features/                     # 기능별 컴포넌트
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── auth-guard.tsx
│   │
│   ├── modules/
│   │   ├── module-card.tsx
│   │   ├── module-list.tsx
│   │   ├── module-detail.tsx
│   │   └── step-indicator.tsx
│   │
│   ├── socratic-dialogue/
│   │   ├── dialogue-container.tsx
│   │   ├── chat-bubble.tsx
│   │   ├── chat-input.tsx
│   │   ├── typing-indicator.tsx
│   │   └── dialogue-complete.tsx
│   │
│   ├── prompt-lab/
│   │   ├── scenario-display.tsx
│   │   ├── prompt-editor.tsx
│   │   ├── response-display.tsx
│   │   └── hint-panel.tsx
│   │
│   ├── comparison-lab/
│   │   ├── comparison-panel.tsx
│   │   ├── side-by-side.tsx
│   │   ├── analysis-chart.tsx
│   │   └── difference-highlight.tsx
│   │
│   ├── reflection-journal/
│   │   ├── reflection-form.tsx
│   │   ├── reflection-card.tsx
│   │   ├── reflection-list.tsx
│   │   └── insight-tags.tsx
│   │
│   ├── progress/
│   │   ├── progress-overview.tsx
│   │   ├── progress-bar.tsx
│   │   ├── badge-display.tsx
│   │   ├── badge-card.tsx
│   │   └── activity-timeline.tsx
│   │
│   ├── resources/
│   │   ├── resource-card.tsx
│   │   └── resource-list.tsx
│   │
│   └── instructor/
│       ├── student-table.tsx
│       ├── progress-chart.tsx
│       └── scenario-editor.tsx
│
└── common/                       # 공통 컴포넌트
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    ├── empty-state.tsx
    ├── language-switcher.tsx
    └── theme-toggle.tsx
```

## 4. Domain 레이어 (src/domain/)

```
src/domain/
├── entities/                     # 도메인 엔티티
│   ├── user.entity.ts
│   ├── module.entity.ts
│   ├── scenario.entity.ts
│   ├── progress.entity.ts
│   ├── dialogue.entity.ts
│   ├── prompt.entity.ts
│   ├── comparison.entity.ts
│   ├── reflection.entity.ts
│   └── badge.entity.ts
│
├── interfaces/                   # 인터페이스 정의
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── module.repository.ts
│   │   ├── progress.repository.ts
│   │   ├── dialogue.repository.ts
│   │   └── reflection.repository.ts
│   └── services/
│       ├── ai.service.ts
│       └── analytics.service.ts
│
└── value-objects/                # 값 객체
    ├── prompt-analysis.vo.ts
    ├── learning-step.vo.ts
    └── comparison-result.vo.ts
```

## 5. Infrastructure 레이어 (src/infrastructure/)

```
src/infrastructure/
├── supabase/                     # Supabase 클라이언트
│   ├── client.ts                 # 브라우저 클라이언트
│   ├── server.ts                 # 서버 클라이언트
│   └── admin.ts                  # Admin 클라이언트
│
├── repositories/                 # Repository 구현체
│   ├── supabase-user.repository.ts
│   ├── supabase-module.repository.ts
│   ├── supabase-progress.repository.ts
│   ├── supabase-dialogue.repository.ts
│   ├── supabase-prompt.repository.ts
│   ├── supabase-comparison.repository.ts
│   └── supabase-reflection.repository.ts
│
├── ai/                           # AI 서비스 구현
│   ├── openai.client.ts          # OpenAI 클라이언트
│   ├── socratic-engine.ts        # 소크라테스 대화 엔진
│   ├── prompt-analyzer.ts        # 프롬프트 분석기
│   └── response-generator.ts     # 응답 생성기
│
└── external/                     # 외부 서비스
    └── analytics.ts              # 분석 서비스
```

## 6. Services 레이어 (src/services/)

```
src/services/
├── auth.service.ts               # 인증 서비스
├── module.service.ts             # 모듈 관리 서비스
├── progress.service.ts           # 진도 관리 서비스
├── dialogue.service.ts           # 대화 관리 서비스
├── prompt.service.ts             # 프롬프트 관리 서비스
├── comparison.service.ts         # 비교 분석 서비스
├── reflection.service.ts         # 성찰 관리 서비스
├── badge.service.ts              # 배지 관리 서비스
└── instructor.service.ts         # 교수자 기능 서비스
```

## 7. Hooks (src/hooks/)

```
src/hooks/
├── useAuth.ts                    # 인증 상태 및 액션
├── useUser.ts                    # 사용자 정보
├── useModule.ts                  # 모듈 데이터
├── useModules.ts                 # 모듈 목록
├── useProgress.ts                # 진도 관리
├── useDialogue.ts                # 대화 관리
├── useStreamDialogue.ts          # 스트리밍 대화
├── usePromptSubmit.ts            # 프롬프트 제출
├── useComparison.ts              # 비교 분석
├── useReflections.ts             # 성찰 저널
├── useBadges.ts                  # 배지 관리
├── useLanguage.ts                # 언어 설정
└── useMediaQuery.ts              # 반응형 처리
```

## 8. Stores (src/stores/)

```
src/stores/
├── auth.store.ts                 # 인증 상태
├── module.store.ts               # 모듈 상태
├── progress.store.ts             # 진도 상태
├── dialogue.store.ts             # 대화 상태
├── ui.store.ts                   # UI 상태 (사이드바, 모달 등)
└── index.ts                      # Store 통합 export
```

## 9. Lib (src/lib/)

```
src/lib/
├── utils/
│   ├── cn.ts                     # className 유틸리티
│   ├── date.ts                   # 날짜 포맷팅
│   ├── string.ts                 # 문자열 처리
│   └── error.ts                  # 에러 처리
│
├── validations/
│   ├── auth.schema.ts            # 인증 검증
│   ├── prompt.schema.ts          # 프롬프트 검증
│   └── reflection.schema.ts      # 성찰 검증
│
├── constants/
│   ├── routes.ts                 # 라우트 상수
│   ├── api.ts                    # API 엔드포인트
│   ├── techniques.ts             # 테크닉 정보
│   └── messages.ts               # 시스템 메시지
│
└── i18n/
    ├── config.ts                 # i18n 설정
    └── dictionaries/
        ├── ko.json
        └── en.json
```

## 10. Tests 구조

```
tests/
├── unit/
│   ├── services/
│   ├── hooks/
│   └── components/
├── integration/
│   ├── api/
│   └── features/
├── e2e/
│   ├── auth.spec.ts
│   ├── module-learning.spec.ts
│   └── reflection.spec.ts
└── fixtures/
    ├── users.ts
    ├── modules.ts
    └── scenarios.ts
```

## 11. Supabase 구조

```
supabase/
├── migrations/
│   ├── 00001_initial_schema.sql
│   ├── 00002_create_profiles.sql
│   ├── 00003_create_modules.sql
│   ├── 00004_create_scenarios.sql
│   ├── 00005_create_progress.sql
│   ├── 00006_create_dialogues.sql
│   ├── 00007_create_prompts.sql
│   ├── 00008_create_comparisons.sql
│   ├── 00009_create_reflections.sql
│   ├── 00010_create_badges.sql
│   ├── 00011_create_functions.sql
│   └── 00012_create_rls_policies.sql
├── seed.sql                      # 초기 모듈/시나리오 데이터
└── config.toml                   # Supabase 설정
```

## 12. 환경 변수

```env
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo-preview

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Prompt Lab

# Analytics (선택)
NEXT_PUBLIC_GA_ID=
```
