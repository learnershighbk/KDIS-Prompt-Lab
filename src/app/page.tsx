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
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useCurrentUser();
  const { t } = useTranslation();

  const modules = useMemo(() => [
    {
      id: 1,
      title: t('landing.modules.module1.title'),
      technique: 'Chain of Thought',
      description: t('landing.modules.module1.description'),
    },
    {
      id: 2,
      title: t('landing.modules.module2.title'),
      technique: 'Few-shot Learning',
      description: t('landing.modules.module2.description'),
    },
    {
      id: 3,
      title: t('landing.modules.module3.title'),
      technique: 'Self-Consistency',
      description: t('landing.modules.module3.description'),
    },
    {
      id: 4,
      title: t('landing.modules.module4.title'),
      technique: 'Persona Setting',
      description: t('landing.modules.module4.description'),
    },
    {
      id: 5,
      title: t('landing.modules.module5.title'),
      technique: 'Constraints',
      description: t('landing.modules.module5.description'),
    },
  ], [t]);

  const steps = useMemo(() => [
    {
      number: "01",
      title: t('landing.steps.step1.title'),
      description: t('landing.steps.step1.description'),
      icon: MessageCircle,
    },
    {
      number: "02",
      title: t('landing.steps.step2.title'),
      description: t('landing.steps.step2.description'),
      icon: PenTool,
    },
    {
      number: "03",
      title: t('landing.steps.step3.title'),
      description: t('landing.steps.step3.description'),
      icon: GitCompare,
    },
    {
      number: "04",
      title: t('landing.steps.step4.title'),
      description: t('landing.steps.step4.description'),
      icon: BookOpen,
    },
  ], [t]);

  const ctaButton = useMemo(() => {
    if (isLoading) {
      return (
        <button
          disabled
          className="px-8 py-4 text-base font-medium rounded-full transition-all"
          style={{ backgroundColor: "#D9D8DA", color: "#666" }}
        >
          {t('common.loading')}
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
            {t('navigation.goToDashboard')}
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
            {t('landing.startFree')}
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
            {t('auth.login')}
          </button>
        </Link>
      </div>
    );
  }, [isAuthenticated, isLoading, t]);

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
              {t('navigation.modules')}
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: "#292727" }}
            >
              {t('landing.resources')}
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
                {t('navigation.dashboard')}
              </button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-60"
                style={{ color: "#292727" }}
              >
                {t('auth.login')}
              </Link>
              <Link href="/signup">
                <button
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all hover:scale-105"
                  style={{ backgroundColor: "#292727" }}
                >
                  {t('navigation.start')}
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
                {t('landing.kdiSchoolOnly')}
              </div>

              <h1
                className="text-5xl lg:text-7xl leading-[1.1] mb-8 font-serif"
                style={{ color: "#292727" }}
              >
                <span className="italic">{t('landing.heroTitle1')}</span>
                <br />
                <span className="italic">{t('landing.heroTitle2')}</span>
              </h1>

              <p
                className="text-lg lg:text-xl leading-relaxed mb-10 max-w-lg font-sans"
                style={{ color: "#666" }}
              >
                {t('landing.heroDescription')}
              </p>

              {ctaButton}

              <p
                className="mt-6 text-sm font-sans"
                style={{ color: "#999" }}
              >
                {t('landing.freeForStudents')}
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
              {t('landing.fiveModules')}
            </h2>
            <p
              className="text-lg font-sans"
              style={{ color: "#666" }}
            >
              {t('landing.curriculumDescription')}
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
              {t('landing.startNow')}
            </h2>
            <p
              className="text-lg mb-10 max-w-2xl mx-auto font-sans"
              style={{ color: "rgba(247, 245, 242, 0.7)" }}
            >
              {t('landing.ctaDescription')}
            </p>

            {isAuthenticated ? (
              <Link href="/dashboard">
                <button
                  className="group px-10 py-5 text-base font-medium rounded-full transition-all hover:scale-105 flex items-center gap-2 mx-auto font-sans"
                  style={{ backgroundColor: "#F7F5F2", color: "#292727" }}
                >
                  {t('navigation.goToDashboard')}
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
                    {t('landing.startFree')}
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
                    {t('landing.alreadyHaveAccount')}
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
              {t('landing.startLearning')}
            </span>
            <span className="text-xs font-sans" style={{ color: "#999" }}>
              {t('landing.tryNow')}
            </span>
          </div>
          <ArrowRight className="w-5 h-5 ml-2" style={{ color: "#292727" }} />
        </Link>
      </motion.div>
    </main>
  );
}
