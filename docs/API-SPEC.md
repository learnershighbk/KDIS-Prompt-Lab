# Prompt Lab API 스펙

## 1. API 개요

### 기본 정보
- **Base URL**: `/api/v1`
- **인증**: Supabase JWT (Bearer Token)
- **Content-Type**: `application/json`

### 응답 형식

```typescript
// 성공 응답
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// 에러 응답
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### 에러 코드

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 유효성 검증 실패 |
| `RATE_LIMITED` | 429 | 요청 한도 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

---

## 2. 인증 API

### 2.1 회원가입

```
POST /api/v1/auth/register
```

**Request Body:**
```typescript
{
  email: string;          // KDI School 이메일
  password: string;       // 최소 8자
  fullName: string;
  studentId?: string;
  preferredLanguage?: 'ko' | 'en';
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  }
}
```

### 2.2 로그인

```
POST /api/v1/auth/login
```

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: 'student' | 'instructor' | 'admin';
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  }
}
```

### 2.3 로그아웃

```
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    message: "로그아웃되었습니다."
  }
}
```

### 2.4 세션 갱신

```
POST /api/v1/auth/refresh
```

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

---

## 3. 모듈 API

### 3.1 모듈 목록 조회

```
GET /api/v1/modules
Authorization: Bearer {token}
```

**Query Parameters:**
- `language`: `ko` | `en` (기본: 사용자 설정)

**Response (200):**
```typescript
{
  success: true,
  data: {
    modules: Array<{
      id: string;
      title: string;
      description: string;
      techniques: string[];
      policyContext: string;
      orderIndex: number;
      isLocked: boolean;
      progress: {
        status: 'not_started' | 'in_progress' | 'completed';
        currentStep: string;
        percentage: number;
      } | null;
    }>;
    overallProgress: {
      completed: number;
      total: number;
      percentage: number;
    };
  }
}
```

### 3.2 모듈 상세 조회

```
GET /api/v1/modules/:moduleId
Authorization: Bearer {token}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    module: {
      id: string;
      title: string;
      description: string;
      techniques: string[];
      policyContext: string;
      steps: Array<{
        type: 'socratic_dialogue' | 'prompt_writing' | 'comparison_lab' | 'reflection_journal';
        title: string;
        isCompleted: boolean;
        isCurrent: boolean;
      }>;
      scenarios: Array<{
        id: string;
        title: string;
        category: string;
        context: string;
      }>;
    };
    progress: {
      status: string;
      currentStep: string;
      startedAt: string | null;
    };
  }
}
```

### 3.3 모듈 시작/진입

```
POST /api/v1/modules/:moduleId/start
Authorization: Bearer {token}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    progressId: string;
    firstStep: {
      type: 'socratic_dialogue';
      initialMessage: string;
    };
  }
}
```

---

## 4. 소크라테스 대화 API

### 4.1 대화 시작

```
POST /api/v1/dialogues
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  progressId: string;
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    dialogueId: string;
    initialMessage: {
      role: 'tutor';
      content: string;
      questionType: 'exploration' | 'clarification' | 'assumption' | 'prediction';
    };
  }
}
```

### 4.2 대화 메시지 전송

```
POST /api/v1/dialogues/:dialogueId/messages
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  content: string;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    userMessage: {
      role: 'student';
      content: string;
      timestamp: string;
    };
    tutorResponse: {
      role: 'tutor';
      content: string;
      questionType: string;
      timestamp: string;
    };
    isCompleted: boolean;
    canProceed: boolean;  // 다음 단계로 진행 가능 여부
  }
}
```

### 4.3 대화 기록 조회

```
GET /api/v1/dialogues/:dialogueId
Authorization: Bearer {token}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    dialogueId: string;
    messages: Array<{
      role: 'tutor' | 'student';
      content: string;
      questionType?: string;
      timestamp: string;
    }>;
    isCompleted: boolean;
  }
}
```

---

## 5. 프롬프트 작성 API

### 5.1 시나리오 조회

```
GET /api/v1/scenarios/:scenarioId
Authorization: Bearer {token}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    scenario: {
      id: string;
      title: string;
      category: string;
      context: string;
      hints: string[];  // 선택적 힌트
    };
  }
}
```

### 5.2 프롬프트 제출

```
POST /api/v1/prompts/submit
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  scenarioId: string;
  progressId: string;
  userPrompt: string;
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    attemptId: string;
    aiResponse: string;
    metadata: {
      model: string;
      latencyMs: number;
    };
  }
}
```

### 5.3 프롬프트 시도 기록 조회

```
GET /api/v1/prompts/attempts
Authorization: Bearer {token}
```

**Query Parameters:**
- `scenarioId`: 특정 시나리오 필터
- `limit`: 조회 개수 (기본: 10)
- `offset`: 오프셋

**Response (200):**
```typescript
{
  success: true,
  data: {
    attempts: Array<{
      id: string;
      scenarioId: string;
      userPrompt: string;
      aiResponse: string;
      createdAt: string;
    }>;
  },
  meta: {
    total: number;
    limit: number;
    offset: number;
  }
}
```

---

## 6. 비교 실험실 API

### 6.1 비교 생성

```
POST /api/v1/comparisons
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  attemptId: string;
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    comparisonId: string;
    userPrompt: string;
    userResponse: string;
    improvedPrompt: string;
    improvedResponse: string;
    analysis: {
      specificity: { score: number; feedback: string; };
      context: { score: number; feedback: string; };
      persona: { score: number; feedback: string; };
      outputFormat: { score: number; feedback: string; };
      constraints: { score: number; feedback: string; };
      examples: { score: number; feedback: string; };
      overallScore: number;
      keyDifferences: string[];
      suggestions: string[];
    };
  }
}
```

### 6.2 비교 결과 조회

```
GET /api/v1/comparisons/:comparisonId
Authorization: Bearer {token}
```

---

## 7. 성찰 저널 API

### 7.1 성찰 저장

```
POST /api/v1/reflections
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  progressId: string;
  content: string;
  insights?: {
    keyLearnings: string[];
    nextSteps: string[];
  };
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    reflectionId: string;
    moduleCompleted: boolean;
    badgesEarned: Array<{
      technique: string;
      earnedAt: string;
    }>;
  }
}
```

### 7.2 성찰 목록 조회

```
GET /api/v1/reflections
Authorization: Bearer {token}
```

**Query Parameters:**
- `moduleId`: 특정 모듈 필터

**Response (200):**
```typescript
{
  success: true,
  data: {
    reflections: Array<{
      id: string;
      moduleTitle: string;
      content: string;
      insights: object;
      createdAt: string;
    }>;
  }
}
```

---

## 8. 진도 API

### 8.1 전체 진도 조회

```
GET /api/v1/progress
Authorization: Bearer {token}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    overall: {
      completedModules: number;
      totalModules: number;
      percentage: number;
    };
    modules: Array<{
      moduleId: string;
      moduleTitle: string;
      status: 'not_started' | 'in_progress' | 'completed';
      currentStep: string;
      stepsCompleted: number;
      totalSteps: number;
      completedAt: string | null;
    }>;
    badges: Array<{
      technique: string;
      moduleTitle: string;
      earnedAt: string;
    }>;
    recentActivity: Array<{
      type: 'module_started' | 'step_completed' | 'module_completed';
      moduleTitle: string;
      timestamp: string;
    }>;
  }
}
```

### 8.2 단계 완료 처리

```
POST /api/v1/progress/:progressId/complete-step
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  stepType: 'socratic_dialogue' | 'prompt_writing' | 'comparison_lab' | 'reflection_journal';
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    nextStep: string | null;  // null이면 모듈 완료
    moduleCompleted: boolean;
    unlockedModule: string | null;  // 다음 모듈 잠금 해제
  }
}
```

---

## 9. 교수자 API

### 9.1 학생 진도 조회 (교수자용)

```
GET /api/v1/instructor/students/progress
Authorization: Bearer {token}
X-Role: instructor
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    students: Array<{
      id: string;
      fullName: string;
      email: string;
      progress: {
        completedModules: number;
        totalModules: number;
        percentage: number;
        lastActivity: string;
      };
    }>;
    statistics: {
      averageProgress: number;
      completionRate: number;
      activeStudents: number;
    };
  }
}
```

### 9.2 시나리오 관리 (CRUD)

```
POST /api/v1/instructor/scenarios
PUT /api/v1/instructor/scenarios/:scenarioId
DELETE /api/v1/instructor/scenarios/:scenarioId
Authorization: Bearer {token}
X-Role: instructor
```

---

## 10. 동료 평가 API (Phase 3)

### 10.1 평가 대상 할당 받기

```
GET /api/v1/peer-reviews/assigned
Authorization: Bearer {token}
```

### 10.2 동료 평가 제출

```
POST /api/v1/peer-reviews
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  attemptId: string;
  scores: {
    specificity: number;  // 1-5
    context: number;
    clarity: number;
  };
  feedback: string;
  improvementSuggestions: string;
}
```

---

## 11. AI 스트리밍 API

### 11.1 대화 스트리밍

```
POST /api/v1/ai/stream/dialogue
Authorization: Bearer {token}
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**
```typescript
{
  dialogueId: string;
  userMessage: string;
}
```

**Response (SSE):**
```
event: start
data: {"messageId": "msg_123"}

event: delta
data: {"content": "흥미로운 "}

event: delta
data: {"content": "관점이네요. "}

event: done
data: {"questionType": "clarification", "canProceed": false}
```

### 11.2 프롬프트 응답 스트리밍

```
POST /api/v1/ai/stream/prompt
Authorization: Bearer {token}
Accept: text/event-stream
```

---

## 12. 학습 리소스 API

### 12.1 리소스 목록 조회

```
GET /api/v1/resources
Authorization: Bearer {token}
```

**Query Parameters:**
- `category`: `technique` | `policy` | `general`

**Response (200):**
```typescript
{
  success: true,
  data: {
    resources: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      type: 'article' | 'video' | 'document';
      url: string;
      techniques: string[];
    }>;
  }
}
```

---

## 13. Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth | 10 requests | 1 minute |
| AI (Dialogue/Prompt) | 30 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Streaming | 20 connections | concurrent |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## 14. Webhook (선택사항)

### 모듈 완료 알림

```
POST {webhook_url}
```

**Payload:**
```typescript
{
  event: 'module.completed';
  data: {
    userId: string;
    moduleId: string;
    completedAt: string;
    badges: string[];
  };
  timestamp: string;
}
```
