"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  PenTool,
  GitCompare,
  BookOpen,
  Sparkles,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const modules = [
  {
    id: 1,
    title: "좋은 질문이 좋은 답을 만든다",
    technique: "Chain of Thought",
    description: "프롬프트가 AI 응답 품질에 미치는 영향을 체험적으로 이해",
  },
  {
    id: 2,
    title: "문헌 리뷰 효과적으로 하기",
    technique: "Few-shot Learning",
    description: "학술 문헌 검색, 요약, 정리에 효과적인 프롬프트 작성",
  },
  {
    id: 3,
    title: "정책 비교 분석 요청하기",
    technique: "Self-Consistency",
    description: "국가 간/정책 간 비교 분석을 위한 구조화된 프롬프트",
  },
  {
    id: 4,
    title: "데이터 해석 도움받기",
    technique: "Persona Setting",
    description: "통계 데이터 해석, 시각화 제안에 AI를 효과적으로 활용",
  },
  {
    id: 5,
    title: "정책 문서 작성 지원받기",
    technique: "Constraints",
    description: "브리핑, 정책 메모, 제안서 등 실무 문서 작성 지원",
  },
];

const steps = [
  {
    number: "01",
    title: "소크라테스 대화",
    description: "AI 튜터의 유도 질문으로 원리를 발견",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "프롬프트 작성",
    description: "정책 시나리오에 맞는 프롬프트 작성",
    icon: PenTool,
  },
  {
    number: "03",
    title: "비교 실험실",
    description: "내 프롬프트와 개선안 결과 비교",
    icon: GitCompare,
  },
  {
    number: "04",
    title: "성찰 저널",
    description: "배운 점 정리 및 적용",
    icon: BookOpen,
  },
];

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  const ctaButton = useMemo(() => {
    if (isLoading) {
      return (
        <button
          disabled
          className="px-8 py-4 text-base font-medium rounded-full transition-all"
          style={{ backgroundColor: "#D9D8DA", color: "#666" }}
        >
          로딩 중...
        </button>
      );
    }

    if (isAuthenticated) {
      return (
        <Link href="/dashboard">
          <button
            className="group px-8 py-4 text-base font-medium text-white rounded-full transition-all hover:scale-105 flex items-center gap-2"
            style={{ backgroundColor: "#292727" }}
          >
            대시보드로 이동
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/signup">
          <button
            className="group px-8 py-4 text-base font-medium text-white rounded-full transition-all hover:scale-105 flex items-center gap-2"
            style={{ backgroundColor: "#292727" }}
          >
            무료로 시작하기
            <Sparkles className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/login">
          <button
            className="px-8 py-4 text-base font-medium rounded-full transition-all hover:scale-105"
            style={{
              backgroundColor: "transparent",
              color: "#292727",
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            로그인
          </button>
        </Link>
      </div>
    );
  }, [isAuthenticated, isLoading]);

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: "#F7F5F2" }}>
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(247, 245, 242, 0.9)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl tracking-tight font-serif italic"
            style={{ color: "#292727" }}
          >
            Prompt Lab
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/modules"
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: "#292727" }}
            >
              학습 모듈
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: "#292727" }}
            >
              리소스
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button
                className="px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: "#292727" }}
              >
                대시보드
              </button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-60"
                style={{ color: "#292727" }}
              >
                로그인
              </Link>
              <Link href="/signup">
                <button
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all hover:scale-105"
                  style={{ backgroundColor: "#292727" }}
                >
                  시작하기
                </button>
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(201, 162, 39, 0.08)" }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.05)" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-8"
                style={{
                  backgroundColor: "rgba(0,0,0,0.05)",
                  color: "#292727",
                }}
              >
                <GraduationCap className="w-4 h-4" />
                KDI School 전용
              </div>

              <h1
                className="text-5xl lg:text-7xl leading-[1.1] mb-8 font-serif"
                style={{ color: "#292727" }}
              >
                <span className="italic">가르치지 않고</span>
                <br />
                <span className="italic">깨닫게 한다</span>
              </h1>

              <p
                className="text-lg lg:text-xl leading-relaxed mb-10 max-w-lg font-sans"
                style={{ color: "#666" }}
              >
                소크라테스식 대화를 통해 프롬프트 엔지니어링의 핵심 원리를
                스스로 체득하세요. 정책 학습과 리서치에 바로 적용할 수 있습니다.
              </p>

              {ctaButton}

              <p
                className="mt-6 text-sm font-sans"
                style={{ color: "#999" }}
              >
                KDI School 학생이라면 누구나 무료
              </p>
            </motion.div>

            {/* Right Content - Steps Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                />
                <div className="relative grid grid-cols-2 gap-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                      style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <div
                        className="text-xs font-medium mb-3 font-sans"
                        style={{ color: "#C9A227" }}
                      >
                        STEP {step.number}
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: "#F7F5F2" }}
                      >
                        <step.icon className="w-5 h-5" style={{ color: "#292727" }} />
                      </div>
                      <h3
                        className="font-semibold mb-2 font-sans"
                        style={{ color: "#292727" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm font-sans"
                        style={{ color: "#666" }}
                      >
                        {step.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-24" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl lg:text-5xl font-serif italic mb-4"
              style={{ color: "#292727" }}
            >
              5개의 실전 모듈
            </h2>
            <p
              className="text-lg font-sans"
              style={{ color: "#666" }}
            >
              정책대학원생을 위해 설계된 커리큘럼
            </p>
          </motion.div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="group flex items-center justify-between p-6 lg:p-8 rounded-2xl transition-all cursor-pointer hover:shadow-lg"
                  style={{
                    backgroundColor: "#F7F5F2",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.border = "1px solid rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F7F5F2";
                    e.currentTarget.style.border = "1px solid transparent";
                  }}
                >
                  <div className="flex items-center gap-6 lg:gap-8">
                    <div
                      className="text-3xl lg:text-4xl font-serif italic"
                      style={{ color: "#C9A227" }}
                    >
                      {String(module.id).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="text-lg lg:text-xl font-semibold font-sans"
                          style={{ color: "#292727" }}
                        >
                          {module.title}
                        </h3>
                        <span
                          className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium font-sans"
                          style={{
                            backgroundColor: "rgba(201, 162, 39, 0.15)",
                            color: "#292727",
                          }}
                        >
                          {module.technique}
                        </span>
                      </div>
                      <p
                        className="text-sm lg:text-base font-sans"
                        style={{ color: "#666" }}
                      >
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className="w-6 h-6 transition-transform group-hover:translate-x-2"
                    style={{ color: "#292727" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" style={{ backgroundColor: "#292727" }}>
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-4xl lg:text-5xl font-serif italic mb-6"
              style={{ color: "#F7F5F2" }}
            >
              지금 시작하세요
            </h2>
            <p
              className="text-lg mb-10 max-w-2xl mx-auto font-sans"
              style={{ color: "rgba(247, 245, 242, 0.7)" }}
            >
              프롬프트 엔지니어링 역량을 키우고 정책 연구의 효율을 높여보세요.
              소크라테스 선생님이 기다리고 있습니다.
            </p>

            {isAuthenticated ? (
              <Link href="/dashboard">
                <button
                  className="group px-10 py-5 text-base font-medium rounded-full transition-all hover:scale-105 flex items-center gap-2 mx-auto font-sans"
                  style={{ backgroundColor: "#F7F5F2", color: "#292727" }}
                >
                  대시보드로 이동
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <button
                    className="group px-10 py-5 text-base font-medium rounded-full transition-all hover:scale-105 flex items-center gap-2 font-sans"
                    style={{ backgroundColor: "#F7F5F2", color: "#292727" }}
                  >
                    무료로 시작하기
                    <Sparkles className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    className="px-10 py-5 text-base font-medium rounded-full transition-all hover:scale-105 font-sans"
                    style={{
                      backgroundColor: "transparent",
                      color: "#F7F5F2",
                      border: "1px solid rgba(247, 245, 242, 0.3)",
                    }}
                  >
                    이미 계정이 있어요
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8"
        style={{
          backgroundColor: "#F7F5F2",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xl font-serif italic"
              style={{ color: "#292727" }}
            >
              Prompt Lab
            </Link>
            <p className="text-sm font-sans" style={{ color: "#999" }}>
              © 2025 KDI School Educational Technology Team
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom floating CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="fixed bottom-6 right-6 z-40 hidden lg:block"
      >
        <Link
          href={isAuthenticated ? "/dashboard" : "/signup"}
          className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#292727" }}
          >
            <span className="text-white text-lg font-serif italic">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium font-sans" style={{ color: "#292727" }}>
              학습 시작하기
            </span>
            <span className="text-xs font-sans" style={{ color: "#999" }}>
              지금 바로 체험해보세요
            </span>
          </div>
          <ArrowRight className="w-5 h-5 ml-2" style={{ color: "#292727" }} />
        </Link>
      </motion.div>
    </main>
  );
}
