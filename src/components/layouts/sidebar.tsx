'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  BarChart3,
  BookMarked,
  History,
  User,
  GraduationCap,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasRole } = useAuthStore();
  const { t } = useTranslation();

  const mainNavItems = [
    { href: ROUTES.DASHBOARD, label: t('navigation.dashboard'), icon: LayoutDashboard },
    { href: ROUTES.MODULES, label: t('navigation.modules'), icon: BookOpen },
    { href: ROUTES.RESOURCES, label: t('navigation.resources'), icon: Library },
  ];

  const mypageNavItems = [
    { href: ROUTES.MYPAGE.PROGRESS, label: t('navigation.progress'), icon: BarChart3 },
    { href: ROUTES.MYPAGE.JOURNALS, label: t('navigation.journals'), icon: BookMarked },
    { href: ROUTES.MYPAGE.PROMPTS, label: t('navigation.prompts'), icon: History },
    { href: ROUTES.MYPAGE.PROFILE, label: t('navigation.profile'), icon: User },
  ];

  const isInstructor = hasRole('instructor') || hasRole('admin');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300 md:translate-x-0 md:static md:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b md:hidden">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Prompt Lab</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-6">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('navigation.mypage')}
            </h3>
            <div className="space-y-1">
              {mypageNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {isInstructor && (
            <div className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('navigation.instructorMenu')}
              </h3>
              <div className="space-y-1">
                <Link
                  href={ROUTES.INSTRUCTOR.HOME}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith('/instructor')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <BarChart3 className="h-5 w-5" />
                  {t('navigation.instructorDashboard')}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
