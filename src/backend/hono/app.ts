import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import { registerModulesRoutes } from '@/features/modules/backend/route';
import { registerProgressRoutes } from '@/features/progress/backend/route';
import { registerDialoguesRoutes } from '@/features/dialogues/backend/route';
import { registerAIRoutes } from '@/features/ai/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (process.env.NODE_ENV === 'development') {
    singletonApp = null;
  }

  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerAuthRoutes(app);
  registerModulesRoutes(app);
  registerProgressRoutes(app);
  registerDialoguesRoutes(app);
  registerAIRoutes(app);

  singletonApp = app;

  return app;
};
