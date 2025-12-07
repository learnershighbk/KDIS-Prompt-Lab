"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { KeyRound, User, Loader2 } from "lucide-react";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
};

export default function LoginPage({ params }: LoginPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { simpleLogin, isAuthenticated } = useAuthStore();
  const [formState, setFormState] = useState({ studentId: "", pin: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/dashboard";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      
      if (name === "studentId") {
        const numericValue = value.replace(/\D/g, "").slice(0, 9);
        setFormState((prev) => ({ ...prev, [name]: numericValue }));
      } else if (name === "pin") {
        const numericValue = value.replace(/\D/g, "").slice(0, 4);
        setFormState((prev) => ({ ...prev, [name]: numericValue }));
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setErrorMessage(null);

      if (formState.studentId.length !== 9) {
        setErrorMessage("학번(사번)은 9자리 숫자를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      if (formState.pin.length !== 4) {
        setErrorMessage("PIN은 4자리 숫자를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      try {
        const result = await simpleLogin(formState.studentId, formState.pin);

        if (result.success) {
          const redirectedFrom = searchParams.get("redirectedFrom") ?? "/dashboard";
          router.replace(redirectedFrom);
        } else {
          setErrorMessage(result.error ?? "로그인에 실패했습니다.");
        }
      } catch {
        setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState.studentId, formState.pin, simpleLogin, router, searchParams]
  );

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold">간편 로그인</h1>
        <p className="text-slate-500">
          학번(사번)과 4자리 PIN으로 빠르게 시작하세요.
        </p>
      </header>

      <div className="grid w-full gap-8 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="flex items-center gap-2 font-medium">
              <User className="h-4 w-4" />
              학번 (사번)
            </span>
            <input
              type="text"
              name="studentId"
              inputMode="numeric"
              pattern="\d*"
              autoComplete="username"
              placeholder="9자리 숫자 입력"
              required
              value={formState.studentId}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-4 py-3 text-lg tracking-wider focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-xs text-slate-400">
              {formState.studentId.length}/9자리
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="flex items-center gap-2 font-medium">
              <KeyRound className="h-4 w-4" />
              PIN 번호
            </span>
            <input
              type="password"
              name="pin"
              inputMode="numeric"
              pattern="\d*"
              autoComplete="current-password"
              placeholder="4자리 숫자 입력"
              required
              value={formState.pin}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-4 py-3 text-lg tracking-[0.5em] text-center focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-xs text-slate-400">
              {formState.pin.length}/4자리
            </span>
          </label>

          {errorMessage && (
            <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </button>

          <p className="mt-2 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
            💡 <strong>처음 오셨나요?</strong> 학번과 원하시는 PIN을 입력하면 자동으로 계정이 생성됩니다.
          </p>
        </form>

        <figure className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
          <Image
            src="https://picsum.photos/seed/promptlab-login/640/640"
            alt="로그인"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
