import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { CurrentUserSnapshot } from "../types";

const mapUser = (user: User) => ({
  id: user.id,
  email: user.email,
  appMetadata: user.app_metadata ?? {},
  userMetadata: user.user_metadata ?? {},
});

type ErrorWithDigest = Error & { digest?: string };

const isDynamicServerUsageError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return (error as ErrorWithDigest).digest === "DYNAMIC_SERVER_USAGE";
};

export const loadCurrentUser = async (): Promise<CurrentUserSnapshot> => {
  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    const user = result.data.user;

    if (user) {
      return {
        status: "authenticated",
        user: mapUser(user),
      };
    }

    return { status: "unauthenticated", user: null };
  } catch (error: unknown) {
    if (!isDynamicServerUsageError(error)) {
      console.error("loadCurrentUser 에러:", error);
    }
    return { status: "unauthenticated", user: null };
  }
};
