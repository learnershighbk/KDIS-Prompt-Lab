# Prompt Lab 기술 스택

## 1. 핵심 기술

### Frontend Framework
```
Next.js 15 (App Router)
├── React 19
├── TypeScript 5.x
└── Server Components / Server Actions
```

### Styling
```
Tailwind CSS 3.4
├── shadcn/ui (Radix UI 기반)
├── Tailwind Merge
└── clsx
```

### State Management
```
Zustand 5.x
├── 전역 상태 관리
├── persist middleware (로컬 저장소)
└── devtools
```

### Data Fetching
```
TanStack Query 5.x (React Query)
├── 서버 상태 관리
├── 캐싱
├── 자동 재시도
└── 낙관적 업데이트
```

### Backend / Database
```
Supabase
├── PostgreSQL 15
├── Auth (Supabase Auth)
├── RLS 비활성화 (애플리케이션 레벨 권한 관리)
├── Edge Functions
└── Realtime (선택)
```

### AI Integration
```
Anthropic Claude API
├── Claude 3.5 Sonnet / Claude 3 Opus
├── Streaming (Server-Sent Events)
└── Tool Use (Function Calling)
```

## 2. 개발 도구

### SuperNext Template
```
SuperNext by BuilderKit
├── Next.js 15 App Router 보일러플레이트
├── 인증 설정 (Supabase)
├── shadcn/ui 사전 설정
├── TypeScript 설정
└── 폴더 구조 표준화
```

### Cursor AI + Ruler
```
Cursor AI
├── AI 코드 어시스턴트
└── Composer 기능

Ruler (.cursor/rules)
├── 프로젝트 규칙 정의
├── 코드 스타일 강제
└── 에이전트 지침
```

### Claude Code
```
Claude Code (CLI)
├── 터미널 기반 에이전트
├── 병렬 작업 지원
└── 파일 생성/수정
```

## 3. 라이브러리 목록

### 핵심 의존성
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@tanstack/react-query": "^5.50.0",
    "zustand": "^5.0.0",
    "zod": "^3.23.0",
    "@anthropic-ai/sdk": "^0.30.0"
  }
}
```

### UI 컴포넌트
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "lucide-react": "^0.400.0",
    "sonner": "^1.5.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0"
  }
}
```

### 폼 처리
```json
{
  "dependencies": {
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0"
  }
}
```

### 마크다운 / 에디터
```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "@uiw/react-textarea-code-editor": "^3.0.0"
  }
}
```

### 차트 / 시각화
```json
{
  "dependencies": {
    "recharts": "^2.12.0"
  }
}
```

### 다국어 지원
```json
{
  "dependencies": {
    "next-intl": "^3.17.0"
  }
}
```

### 유틸리티
```json
{
  "dependencies": {
    "date-fns": "^3.6.0",
    "nanoid": "^5.0.0"
  }
}
```

### 개발 의존성
```json
{
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.14.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

### 테스트 (선택)
```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@playwright/test": "^1.45.0"
  }
}
```

## 4. 설정 파일

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // KDI School 브랜드 컬러
        kdi: {
          blue: '#003366',
          gold: '#C9A227',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      { "name": "next" }
    ],
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
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 5. Cursor Ruler 설정

### .cursor/rules/project.mdc
```markdown
# Prompt Lab 프로젝트 규칙

## 코드 스타일
- TypeScript strict mode 사용
- 함수형 컴포넌트만 사용 (React.FC 미사용)
- 명시적 return type 권장
- 상대 경로 대신 @ alias 사용

## 네이밍 컨벤션
- 컴포넌트: PascalCase (ModuleCard.tsx)
- 훅: camelCase (useModule.ts)
- 타입: PascalCase (ModuleWithProgress)
- 상수: UPPER_SNAKE_CASE

## 파일 구조
- 한 파일에 하나의 컴포넌트만
- barrel exports 사용 (index.ts)
- 관련 타입은 동일 파일에 정의

## Import 순서
1. React/Next.js
2. 외부 라이브러리
3. 내부 모듈 (@/*)
4. 상대 경로 (./*)
5. 타입 imports

## 컴포넌트 구조
1. Type definitions
2. Component function
3. Export

## 금지 사항
- any 타입 사용 금지
- console.log 프로덕션 코드 금지
- 인라인 스타일 금지 (Tailwind 사용)
```

## 6. 환경별 설정

### Development
```
- Hot Reload 활성화
- 상세 에러 메시지
- Supabase Local (선택)
- 디버깅 도구 활성화
```

### Production
```
- 빌드 최적화
- 에러 로깅 (Sentry 등)
- CDN 캐싱
- 환경 변수 보호
```

## 7. 배포

### Vercel 배포
```yaml
# vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

### 환경 변수 설정
```
Vercel Dashboard → Settings → Environment Variables
├── NEXT_PUBLIC_SUPABASE_URL
├── NEXT_PUBLIC_SUPABASE_ANON_KEY
├── SUPABASE_SERVICE_ROLE_KEY
├── ANTHROPIC_API_KEY
└── NEXT_PUBLIC_APP_URL
```

## 8. 성능 최적화

### 적용 기술
```
1. React Server Components (RSC)
2. Streaming SSR
3. Dynamic Imports
4. Image Optimization (next/image)
5. Route Segment Config (revalidate)
6. React Query 캐싱
7. Zustand persist (로컬 스토리지)
```

### 목표 지표
```
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- API 응답 시간: < 3s (스트리밍 시작)
```
