'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Library, LogOut, Menu, User2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/constants/routes';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  const navItems = [
    { href: ROUTES.MODULES, label: '학습 모듈', icon: BookOpen },
    { href: ROUTES.RESOURCES, label: '학습 리소스', icon: Library },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.LOGIN);
  };

  const displayId = user?.studentId ?? user?.email?.split('@')[0] ?? '사용자';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary hidden sm:inline">Prompt Lab</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
                <User2 className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {displayId}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-600 hover:text-destructive hover:border-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href={ROUTES.LOGIN}>로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
