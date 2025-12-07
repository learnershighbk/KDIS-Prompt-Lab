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
│  (Supabase, OpenAI API, External Services)                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. 레이어별 책임

### 2.1 Presentation Layer (프레젠테이션 계층)

**책임**: UI 렌더링, 사용자 상호작용 처리

**위치**: `src/components/`, `src/app/`

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # 대시보드 라우트 그룹
│   │   ├── modules/
│   │   ├── journal/
│   │   └── resources/
│   ├── (instructor)/             # 교수자 라우트 그룹
│   └── api/                      # API Routes
├── components/
│   ├── ui/                       # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── features/                 # 기능별 컴포넌트
│   │   ├── socratic-dialogue/
│   │   ├── prompt-lab/
│   │   ├── comparison-lab/
│   │   └── reflection-journal/
│   └── layouts/                  # 레이아웃 컴포넌트
```

### 2.2 Application Layer (애플리케이션 계층)

**책임**: 유스케이스 구현, 비즈니스 로직 조율

**위치**: `src/services/`, `src/hooks/`, `src/stores/`

```
src/
├── services/                     # 비즈니스 서비스
│   ├── auth.service.ts
│   ├── module.service.ts
│   ├── dialogue.service.ts
│   ├── comparison.service.ts
│   └── progress.service.ts
├── hooks/                        # Custom Hooks
│   ├── useAuth.ts
│   ├── useModule.ts
│   ├── useDialogue.ts
│   └── useProgress.ts
└── stores/                       # Zustand 상태 관리
    ├── auth.store.ts
    ├── module.store.ts
    └── progress.store.ts
```

### 2.3 Domain Layer (도메인 계층)

**책임**: 핵심 비즈니스 엔티티, 인터페이스 정의

**위치**: `src/domain/`

```
src/domain/
├── entities/                     # 도메인 엔티티
│   ├── user.entity.ts
│   ├── module.entity.ts
│   ├── scenario.entity.ts
│   ├── prompt.entity.ts
│   ├── dialogue.entity.ts
│   └── progress.entity.ts
├── interfaces/                   # 인터페이스 정의
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── module.repository.ts
│   │   └── progress.repository.ts
│   └── services/
│       ├── ai.service.ts
│       └── analytics.service.ts
└── value-objects/                # 값 객체
    ├── prompt-analysis.vo.ts
    └── learning-step.vo.ts
```

### 2.4 Infrastructure Layer (인프라스트럭처 계층)

**책임**: 외부 시스템 연동, 데이터 저장소

**위치**: `src/infrastructure/`

```
src/infrastructure/
├── supabase/                     # Supabase 클라이언트
│   ├── client.ts
│   └── admin.ts
├── repositories/                 # Repository 구현체
│   ├── supabase-user.repository.ts
│   ├── supabase-module.repository.ts
│   └── supabase-progress.repository.ts
├── ai/                           # AI 서비스 구현
│   ├── openai.client.ts
│   ├── socratic-engine.ts
│   └── prompt-analyzer.ts
└── external/                     # 외부 서비스
    └── analytics.ts
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

class OpenAIService implements AIService {
  generateResponse(prompt: string): Promise<string>;
}

class ClaudeService implements AIService {
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
  new OpenAIService()
);
```

## 4. 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│  User Action                                                     │
│      ↓                                                          │
│  React Component → Custom Hook → Service → Repository            │
│      ↓                                                          │
│  Supabase / OpenAI API                                          │
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
| Infrastructure | Supabase, OpenAI API, Vercel |

## 7. 보안 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase Auth (JWT)                                        │
│  - Row Level Security (RLS)                                 │
│  - Session Management                                        │
├─────────────────────────────────────────────────────────────┤
│                    API Routes                                │
│  - Auth Middleware                                          │
│  - Rate Limiting                                            │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Backend                          │
│  - RLS Policies                                             │
│  - API Key Protection                                       │
└─────────────────────────────────────────────────────────────┘
```

## 8. 확장성 고려사항

- **Horizontal Scaling**: Vercel Edge Functions 활용
- **Caching**: React Query 캐싱 + Supabase 캐싱
- **Rate Limiting**: API 호출 제한으로 비용 관리
- **Modular Design**: 새 모듈 추가 시 플러그인 방식 지원
