# Foundation Agent Instructions

> 프로젝트 기초 설정 및 개발 환경 구축 담당 에이전트

## 🎯 역할 및 책임

1. **프로젝트 초기화**: SuperNext 템플릿 설정
2. **개발 환경 구성**: 환경 변수, 설정 파일
3. **코드 품질 도구**: Cursor Ruler, ESLint, Prettier
4. **배포 준비**: Vercel 설정

## 📚 필수 참조 문서

- `docs/TECH-STACK.md` - 기술 스택 및 버전
- `docs/PROJECT-STRUCTURE.md` - 폴더 구조

---

## 📋 작업 체크리스트

### Step 1: 프로젝트 초기화

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest prompt-lab --typescript --tailwind --eslint --app --src-dir
cd prompt-lab

# 핵심 의존성 설치
npm install @supabase/supabase-js @supabase/ssr zustand @tanstack/react-query zod react-hook-form @hookform/resolvers

# shadcn/ui 초기화 및 컴포넌트 설치
npx shadcn@latest init
npx shadcn@latest add button input card dialog tabs avatar badge progress alert skeleton separator scroll-area dropdown-menu tooltip sheet

# 유틸리티 라이브러리
npm install lucide-react sonner date-fns nanoid clsx tailwind-merge react-markdown remark-gfm recharts
```

### Step 2: 폴더 구조 생성

```bash
# 도메인 레이어
mkdir -p src/domain/{entities,interfaces,value-objects}

# 인프라 레이어
mkdir -p src/infrastructure/{supabase,repositories,ai}

# 애플리케이션 레이어
mkdir -p src/{services,hooks,stores}

# 공통 라이브러리
mkdir -p src/lib/{utils,validations,constants,i18n}
mkdir -p src/types

# 컴포넌트
mkdir -p src/components/{ui,layouts,common}
mkdir -p src/components/features/{auth,modules,dialogue,comparison,reflection,progress}

# App Router 페이지
mkdir -p "src/app/(auth)/{login,register}"
mkdir -p "src/app/(dashboard)/modules/[id]"
mkdir -p "src/app/(dashboard)/{journal,profile}"
mkdir -p "src/app/api/v1/{auth,modules,dialogues,prompts,comparisons,reflections,progress,ai}"
```

### Step 3: 환경 변수 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Prompt Lab
```

### Step 4: TypeScript 설정 (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/services/*": ["./src/services/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Step 5: Tailwind 설정 (KDI 브랜드 컬러)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#003366', // KDI Blue
          600: '#002952',
        },
        accent: {
          500: '#C9A227', // KDI Gold
        },
      },
    },
  },
};
```

### Step 6: Cursor Ruler 설정

```bash
mkdir -p .cursor/rules
```

`.cursor/rules/project.mdc` 핵심 규칙:
- TypeScript strict 모드, `any` 금지
- 함수형 컴포넌트만 사용
- Import 순서: React → 외부 → 내부 → 타입 → 상대경로
- 레이어드 아키텍처 준수

### Step 7: 기본 유틸리티 파일 생성

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
// src/lib/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/modules',
  MODULE: (id: string) => `/modules/${id}`,
  JOURNAL: '/journal',
  PROFILE: '/profile',
} as const;
```

---

## ✅ 완료 조건

- [ ] `npm run dev` 정상 실행
- [ ] `npm run build` 오류 없음
- [ ] 모든 폴더 구조 생성됨
- [ ] 환경 변수 템플릿 (.env.example) 존재
- [ ] Cursor Ruler 설정 완료

---

## ➡️ 다음 단계

Foundation 완료 후 → **Database Agent** 실행
