# Prompt Lab 프로젝트 구조

## 1. 전체 디렉토리 구조

```
prompt-lab/
├── .ruler/                       # Ruler 규칙 파일
├── claude/                       # Claude Code 에이전트 설정
│   └── agents/                   # 에이전트별 지침
├── docs/                         # 프로젝트 문서
├── prompts/                      # AI 시스템 프롬프트
├── public/                       # 정적 파일
│   └── images/
├── src/
│   ├── app/                      # Next.js App Router
│   ├── backend/                  # 서버 사이드 로직 (Hono)
│   │   ├── config/               # 환경 변수 파싱
│   │   ├── hono/                 # Hono 앱 본체
│   │   ├── http/                 # 응답 포맷 유틸
│   │   ├── middleware/           # 공통 미들웨어
│   │   └── supabase/             # Supabase 서버 클라이언트
│   ├── components/               # 공통 컴포넌트
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── constants/                # 공통 상수
│   ├── features/                 # 피처 기반 모듈
│   │   └── [featureName]/
│   │       ├── backend/          # 피처별 백엔드
│   │       ├── components/       # 피처별 컴포넌트
│   │       ├── constants/        # 피처별 상수
│   │       ├── hooks/            # 피처별 훅
│   │       ├── stores/           # 피처별 Zustand 스토어
│   │       ├── lib/              # 피처별 유틸/DTO
│   │       └── types.ts          # 피처별 타입
│   ├── stores/                   # 공통 UI 스토어
│   │   └── ui.store.ts           # 테마, 언어, 사이드바 상태
│   ├── hooks/                    # 공통 커스텀 훅
│   └── lib/                      # 공통 유틸리티
│       ├── remote/               # API 클라이언트
│       ├── supabase/             # Supabase 브라우저 클라이언트
│       └── utils.ts
├── supabase/                     # Supabase 설정
│   └── migrations/               # DB 마이그레이션
├── .env.local                    # 환경 변수 (로컬)
├── .env.example                  # 환경 변수 예시
├── next.config.ts                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json
```

## 2. App Router 구조 (src/app/)

```
src/app/
├── (protected)/                  # 인증 필요 라우트 그룹
│   ├── layout.tsx                # 인증 체크 레이아웃
│   ├── dashboard/
│   │   └── page.tsx              # 메인 대시보드
│   ├── modules/
│   │   ├── page.tsx              # 모듈 목록 (/modules)
│   │   └── [moduleId]/
│   │       └── page.tsx          # 모듈 상세 (/modules/[id])
│   ├── journal/
│   │   ├── page.tsx              # 성찰 저널 목록
│   │   └── [reflectionId]/
│   │       └── page.tsx          # 저널 상세
│   ├── resources/
│   │   └── page.tsx              # 학습 리소스
│   ├── mypage/
│   │   ├── progress/
│   │   │   └── page.tsx          # 내 학습 진도
│   │   ├── journals/
│   │   │   └── page.tsx          # 성찰 저널 목록
│   │   ├── prompts/
│   │   │   └── page.tsx          # 프롬프트 히스토리
│   │   └── profile/
│   │       └── page.tsx          # 프로필 설정
│   └── instructor/               # 교수자 전용 (권한 체크)
│       ├── page.tsx              # 교수자 대시보드
│       ├── students/
│       │   └── page.tsx          # 학생 진도 관리
│       ├── scenarios/
│       │   └── page.tsx          # 시나리오 관리
│       └── reviews/
│           └── page.tsx          # 성찰 저널 리뷰
│
├── api/                          # API Routes (Hono 위임)
│   └── [[...hono]]/
│       └── route.ts              # Hono 앱 핸들러
│
├── login/
│   └── page.tsx                  # 로그인
├── signup/
│   └── page.tsx                  # 회원가입
│
├── globals.css                   # 전역 CSS
├── layout.tsx                    # 루트 레이아웃
├── providers.tsx                 # 전역 프로바이더
├── page.tsx                      # 랜딩 페이지 (/)
├── loading.tsx                   # 전역 로딩 UI
├── error.tsx                     # 전역 에러 UI
└── not-found.tsx                 # 404 페이지
```

## 3. Components 구조 (src/components/)

**공통 컴포넌트**만 `src/components/`에 위치하며, **피처별 컴포넌트**는 `src/features/[featureName]/components/`에 위치합니다.

```
src/components/
├── ui/                           # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── accordion.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   └── tooltip.tsx
│
├── layouts/                      # 레이아웃 컴포넌트
│   ├── header.tsx                # 공통 헤더
│   ├── sidebar.tsx               # 사이드바
│   ├── footer.tsx                # 푸터
│   └── dashboard-layout.tsx      # 대시보드 레이아웃
│
└── common/                       # 공통 유틸 컴포넌트
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    ├── empty-state.tsx
    └── theme-toggle.tsx
```

## 4. Features 구조 (src/features/) - 피처 기반 모듈

각 피처는 독립적인 모듈로 구성되며, 백엔드/프론트엔드 코드가 함께 위치합니다.

```
src/features/
├── auth/                         # 인증 피처
│   ├── backend/
│   │   ├── route.ts              # Hono 라우터 (/api/auth/*)
│   │   ├── service.ts            # 비즈니스 로직
│   │   ├── schema.ts             # Zod 스키마
│   │   └── error.ts              # 에러 코드
│   ├── components/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── context/
│   │   └── current-user-context.tsx
│   ├── hooks/
│   │   └── useCurrentUser.ts
│   ├── stores/
│   │   └── auth.store.ts         # 인증 상태 관리
│   ├── lib/
│   │   └── dto.ts                # DTO 재노출
│   └── types.ts
│
├── modules/                      # 학습 모듈 피처
│   ├── backend/
│   │   ├── route.ts              # /api/modules/*
│   │   ├── service.ts
│   │   └── schema.ts
│   ├── components/
│   │   ├── module-card.tsx
│   │   ├── module-list.tsx
│   │   ├── step-indicator.tsx
│   │   └── module-detail.tsx
│   ├── hooks/
│   │   ├── useModules.ts
│   │   └── useModule.ts
│   └── types.ts
│
├── dialogue/                     # 소크라테스 대화 피처
│   ├── backend/
│   │   ├── route.ts              # /api/dialogues/*
│   │   ├── service.ts
│   │   ├── schema.ts
│   │   └── socratic-engine.ts    # AI 대화 엔진
│   ├── components/
│   │   ├── dialogue-container.tsx
│   │   ├── chat-bubble.tsx
│   │   ├── chat-input.tsx
│   │   └── typing-indicator.tsx
│   ├── hooks/
│   │   └── useDialogue.ts
│   ├── stores/
│   │   └── dialogue.store.ts     # 대화 상태 관리
│   └── types.ts
│
├── prompt-lab/                   # 프롬프트 작성 피처
│   ├── backend/
│   │   ├── route.ts              # /api/prompts/*
│   │   ├── service.ts
│   │   └── schema.ts
│   ├── components/
│   │   ├── scenario-display.tsx
│   │   ├── prompt-editor.tsx
│   │   └── response-display.tsx
│   ├── hooks/
│   │   └── usePromptSubmit.ts
│   └── types.ts
│
├── comparison/                   # 비교 실험실 피처
│   ├── backend/
│   │   ├── route.ts              # /api/comparisons/*
│   │   ├── service.ts
│   │   ├── schema.ts
│   │   └── prompt-analyzer.ts    # AI 분석기
│   ├── components/
│   │   ├── comparison-panel.tsx
│   │   ├── side-by-side.tsx
│   │   └── analysis-chart.tsx
│   ├── hooks/
│   │   └── useComparison.ts
│   └── types.ts
│
├── reflection/                   # 성찰 저널 피처
│   ├── backend/
│   │   ├── route.ts              # /api/reflections/*
│   │   ├── service.ts
│   │   └── schema.ts
│   ├── components/
│   │   ├── reflection-form.tsx
│   │   ├── reflection-card.tsx
│   │   └── reflection-list.tsx
│   ├── hooks/
│   │   └── useReflections.ts
│   └── types.ts
│
├── progress/                     # 진도 관리 피처
│   ├── backend/
│   │   ├── route.ts              # /api/progress/*
│   │   ├── service.ts
│   │   └── schema.ts
│   ├── components/
│   │   ├── progress-overview.tsx
│   │   ├── badge-display.tsx
│   │   └── activity-timeline.tsx
│   ├── hooks/
│   │   └── useProgress.ts
│   ├── stores/
│   │   └── progress.store.ts     # 진도 상태 관리
│   └── types.ts
│
├── resources/                    # 학습 리소스 피처
│   ├── backend/
│   │   ├── route.ts              # /api/resources/*
│   │   └── service.ts
│   ├── components/
│   │   ├── resource-card.tsx
│   │   └── resource-list.tsx
│   └── types.ts
│
└── instructor/                   # 교수자 기능 피처
    ├── backend/
    │   ├── route.ts              # /api/instructor/*
    │   ├── service.ts
    │   └── schema.ts
    ├── components/
    │   ├── student-table.tsx
    │   ├── progress-chart.tsx
    │   └── scenario-editor.tsx
    ├── hooks/
    │   └── useInstructorData.ts
    └── types.ts
```

## 5. Backend 구조 (src/backend/)

Hono 기반 서버 사이드 로직입니다.

```
src/backend/
├── config/
│   └── index.ts                  # 환경 변수 파싱 (Zod)
│
├── hono/
│   ├── app.ts                    # Hono 앱 생성 (싱글턴)
│   └── context.ts                # AppEnv 타입 정의
│
├── http/
│   └── response.ts               # success/failure/respond 헬퍼
│
├── middleware/
│   ├── context.ts                # withAppContext 미들웨어
│   ├── error.ts                  # errorBoundary 미들웨어
│   └── supabase.ts               # withSupabase 미들웨어
│
└── supabase/
    └── client.ts                 # Supabase 서버 클라이언트
```

## 6. Lib 구조 (src/lib/)

공통 유틸리티 및 클라이언트입니다.

```
src/lib/
├── remote/
│   └── api-client.ts             # HTTP 클라이언트 (fetch 래퍼)
│
├── supabase/
│   ├── browser-client.ts         # 브라우저용 Supabase
│   ├── server-client.ts          # 서버용 Supabase
│   └── types.ts                  # Supabase 타입
│
└── utils.ts                      # cn() 등 공통 유틸
```

## 7. Hooks (src/hooks/)

공통 커스텀 훅입니다. 피처별 훅은 `src/features/[feature]/hooks/`에 위치합니다.

```
src/hooks/
├── use-toast.ts                  # 토스트 알림
├── use-media-query.ts            # 반응형 처리
└── use-local-storage.ts          # 로컬 스토리지
```

## 7-1. Stores (src/stores/)

Zustand 스토어 위치 규칙:
- **공통 UI 스토어**: `src/stores/` (테마, 언어, 사이드바 등 앱 전역 UI 상태)
- **피처별 스토어**: `src/features/[feature]/stores/` (인증, 진도, 대화 등 도메인 상태)

```
src/stores/
└── ui.store.ts                   # 공통 UI 상태 (테마, 언어, 사이드바)

src/features/auth/stores/
└── auth.store.ts                 # 인증 상태 (사용자, 세션)

src/features/progress/stores/
└── progress.store.ts             # 진도 상태 (현재 모듈, 배지)

src/features/dialogue/stores/
└── dialogue.store.ts             # 대화 상태 (메시지, 스트리밍)
```

## 8. Constants (src/constants/)

공통 상수입니다.

```
src/constants/
├── auth.ts                       # 인증 관련 상수
├── env.ts                        # 환경 변수 상수
├── routes.ts                     # 라우트 경로
└── techniques.ts                 # 프롬프트 테크닉 정보
```

## 9. Supabase 마이그레이션

```
supabase/
└── migrations/
    ├── 0001_create_example_table.sql   # 예시 (삭제 예정)
    ├── 0002_create_profiles.sql
    ├── 0003_create_user_roles.sql
    ├── 0004_create_modules.sql
    ├── 0005_create_scenarios.sql
    ├── 0006_create_user_progress.sql
    ├── 0007_create_dialogues.sql
    ├── 0008_create_prompt_attempts.sql
    ├── 0009_create_comparisons.sql
    ├── 0010_create_reflections.sql
    ├── 0011_create_technique_badges.sql
    ├── 0012_create_peer_reviews.sql    # Phase 3
    ├── 0013_create_resources.sql
    └── 0014_create_functions.sql
```

## 10. 환경 변수

```env
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic Claude
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Prompt Lab
```
