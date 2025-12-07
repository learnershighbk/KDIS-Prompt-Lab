export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  MODULES: '/modules',
  MODULE: (id: string) => `/modules/${id}`,
  RESOURCES: '/resources',
  MYPAGE: {
    PROGRESS: '/mypage/progress',
    JOURNALS: '/mypage/journals',
    PROMPTS: '/mypage/prompts',
    PROFILE: '/mypage/profile',
  },
  INSTRUCTOR: {
    HOME: '/instructor',
    STUDENTS: '/instructor/students',
    SCENARIOS: '/instructor/scenarios',
    REVIEWS: '/instructor/reviews',
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.MODULES,
  ROUTES.RESOURCES,
  ROUTES.MYPAGE.PROGRESS,
  ROUTES.MYPAGE.JOURNALS,
  ROUTES.MYPAGE.PROMPTS,
  ROUTES.MYPAGE.PROFILE,
] as const;

export const INSTRUCTOR_ROUTES = [
  ROUTES.INSTRUCTOR.HOME,
  ROUTES.INSTRUCTOR.STUDENTS,
  ROUTES.INSTRUCTOR.SCENARIOS,
  ROUTES.INSTRUCTOR.REVIEWS,
] as const;
