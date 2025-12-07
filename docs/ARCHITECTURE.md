# Prompt Lab 시스템 아키텍처

## 1. 아키텍처 개요

Prompt Lab은 **레이어드 아키텍처(Layered Architecture)**를 기반으로 설계되며, SOLID 원칙을 준수합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Components, Pages, Hooks)                           │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  (Use Cases, Services, State Management)                    │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (Entities, Business Logic, Interfaces)                     │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  (Supabase, Anthropic Claude API, External Services)        │
└─────────────────────────────────────────────────────────────┘
```

## 2. 레이어별 책임

본 프로젝트는 **피처 기반 모듈 구조**를 채택하여, 각 기능이 독립적인 모듈로 구성됩니다.

### 2.1 Presentation Layer (프레젠테이션 계층)

**책임**: UI 렌더링, 사용자 상호작용 처리

**위치**: `src/app/`, `src/components/`, `src/features/[feature]/components/`

```
src/
├── app/                          # Next.js App Router
│   ├── (protected)/              # 인증 필요 라우트 그룹
│   │   ├── dashboard/
│   │   ├── modules/
│   │   ├── mypage/
│   │   └── instructor/
│   ├── api/[[...hono]]/          # Hono 위임 API Routes
│   ├── login/
│   └── signup/
├── components/
│   ├── ui/                       # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── layouts/                  # 레이아웃 컴포넌트
│   └── common/                   # 공통 유틸 컴포넌트
```

### 2.2 Feature Layer (피처 계층) - 핵심

**책임**: 피처별 백엔드/프론트엔드 통합 모듈

**위치**: `src/features/[featureName]/`

```
src/features/
├── auth/                         # 인증 피처
│   ├── backend/
│   │   ├── route.ts              # Hono 라우터 (/api/v1/auth/*)
│   │   ├── service.ts            # 비즈니스 로직
│   │   ├── schema.ts             # Zod 스키마
│   │   └── error.ts              # 에러 코드
│   ├── components/
│   ├── hooks/
│   └── types.ts
├── modules/                      # 학습 모듈 피처
├── dialogue/                     # 소크라테스 대화 피처
├── prompt-lab/                   # 프롬프트 작성 피처
├── comparison/                   # 비교 실험실 피처
├── reflection/                   # 성찰 저널 피처
├── progress/                     # 진도 관리 피처
└── instructor/                   # 교수자 기능 피처
```

### 2.3 Backend Layer (백엔드 계층)

**책임**: 공통 서버 사이드 로직 (Hono 기반)

**위치**: `src/backend/`

```
src/backend/
├── config/                       # 환경 변수 파싱 (Zod)
├── hono/
│   ├── app.ts                    # Hono 앱 생성 (싱글턴)
│   └── context.ts                # AppEnv 타입 정의
├── http/
│   └── response.ts               # success/failure/respond 헬퍼
├── middleware/
│   ├── context.ts                # withAppContext 미들웨어
│   ├── error.ts                  # errorBoundary 미들웨어
│   └── supabase.ts               # withSupabase 미들웨어
└── supabase/
    └── client.ts                 # Supabase 서버 클라이언트
```

### 2.4 Shared Layer (공유 계층)

**책임**: 공통 유틸리티, 타입, 상수

**위치**: `src/lib/`, `src/hooks/`, `src/constants/`

```
src/
├── lib/
│   ├── remote/api-client.ts      # HTTP 클라이언트
│   ├── supabase/                 # Supabase 브라우저 클라이언트
│   └── utils.ts                  # cn() 등 공통 유틸
├── hooks/                        # 공통 커스텀 훅
└── constants/                    # 공통 상수
```

## 3. SOLID 원칙 적용

### 3.1 Single Responsibility Principle (SRP)

각 클래스/모듈은 하나의 책임만 가짐:

```typescript
// ✅ Good: 단일 책임
class SocraticDialogueService {
  generateQuestion(context: DialogueContext): Promise<Question>;
}

class PromptAnalyzerService {
  analyzePrompt(prompt: string): Promise<PromptAnalysis>;
}

// ❌ Bad: 다중 책임
class DialogueManager {
  generateQuestion();
  saveToDatabase();
  sendNotification();
}
```

### 3.2 Open/Closed Principle (OCP)

확장에는 열려있고, 수정에는 닫혀있음:

```typescript
// 새로운 모듈 타입 추가 시 기존 코드 수정 없이 확장
interface ModuleHandler {
  handle(step: LearningStep): Promise<StepResult>;
}

class SocraticDialogueHandler implements ModuleHandler {
  handle(step: LearningStep): Promise<StepResult>;
}

class ComparisonLabHandler implements ModuleHandler {
  handle(step: LearningStep): Promise<StepResult>;
}
```

### 3.3 Liskov Substitution Principle (LSP)

파생 클래스는 기본 클래스를 대체할 수 있어야 함:

```typescript
interface AIService {
  generateResponse(prompt: string): Promise<string>;
}

class AnthropicService implements AIService {
  generateResponse(prompt: string): Promise<string>;
}
```

### 3.4 Interface Segregation Principle (ISP)

클라이언트별 인터페이스 분리:

```typescript
// 학생용 인터페이스
interface StudentModuleView {
  getModules(): Promise<Module[]>;
  getProgress(): Promise<Progress>;
}

// 교수자용 인터페이스
interface InstructorModuleManagement {
  createScenario(): Promise<Scenario>;
  viewStudentProgress(): Promise<StudentProgress[]>;
}
```

### 3.5 Dependency Inversion Principle (DIP)

고수준 모듈이 저수준 모듈에 의존하지 않음:

```typescript
// 인터페이스에 의존
class ModuleService {
  constructor(
    private readonly repository: IModuleRepository,
    private readonly aiService: IAIService
  ) {}
}

// 의존성 주입
const moduleService = new ModuleService(
  new SupabaseModuleRepository(),
  new AnthropicService()
);
```

## 4. 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│  User Action                                                     │
│      ↓                                                          │
│  React Component → Custom Hook → Service → Repository            │
│      ↓                                                          │
│  Supabase / Anthropic Claude API                                │
│      ↓                                                          │
│  Repository → Service → Zustand Store → React Component         │
│      ↓                                                          │
│  UI Update                                                      │
└─────────────────────────────────────────────────────────────────┘
```

## 5. 핵심 플로우

### 5.1 학습 모듈 진행 플로우

```
[모듈 선택] → [Step 1: 소크라테스 대화] → [Step 2: 프롬프트 작성]
                     ↓                            ↓
              AI 유도 질문                   시나리오 기반 작성
                     ↓                            ↓
            [Step 3: 비교 실험실] → [Step 4: 성찰 저널]
                     ↓                     ↓
              결과 비교 분석          학습 내용 정리
                     ↓
              [모듈 완료 → 진도 저장]
```

### 5.2 소크라테스 대화 엔진 플로우

```
[사용자 응답] → [컨텍스트 분석] → [질문 유형 결정]
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
              [탐색 질문]                         [심화 질문]
                    ↓                                   ↓
              기초 개념 확인                     깊이 있는 사고 유도
                    ↓                                   ↓
                    └─────────────────┬─────────────────┘
                                      ↓
                              [다음 단계 결정]
```

## 6. 기술 스택 매핑

| Layer | Technology |
|-------|------------|
| Presentation | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Application | Zustand, React Query, Custom Hooks |
| Domain | TypeScript Interfaces, Zod Validation |
| Infrastructure | Supabase, Anthropic Claude API, Vercel |

## 7. 보안 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase Auth (JWT)                                        │
│  - Session Management                                        │
│  - Token Refresh                                            │
├─────────────────────────────────────────────────────────────┤
│                    API Routes (Hono)                         │
│  - Auth Middleware (JWT 검증)                               │
│  - Role-based Access Control (애플리케이션 레벨)            │
│  - Rate Limiting                                            │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Backend                          │
│  - RLS 비활성화 (애플리케이션 레벨 권한 관리)               │
│  - Service Role Key 사용                                    │
│  - API Key Protection                                       │
└─────────────────────────────────────────────────────────────┘
```

> **Note**: RLS는 비활성화하고, 모든 권한 관리는 Hono 미들웨어에서 애플리케이션 레벨로 처리합니다.

## 8. 확장성 고려사항

- **Horizontal Scaling**: Vercel Edge Functions 활용
- **Caching**: React Query 캐싱 + Supabase 캐싱
- **Rate Limiting**: API 호출 제한으로 비용 관리
- **Modular Design**: 새 모듈 추가 시 플러그인 방식 지원
