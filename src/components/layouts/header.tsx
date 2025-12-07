'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Library, LogOut, Menu, User2, Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';
import { useLocaleStore } from '@/features/i18n/stores/locale.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const { locale, setLocale } = useLocaleStore();

  const navItems = [
    { href: ROUTES.MODULES, label: t('navigation.modules'), icon: BookOpen },
    { href: ROUTES.RESOURCES, label: t('navigation.resources'), icon: Library },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  const displayId = user?.studentId ?? user?.email?.split('@')[0] ?? t('common.user');

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

          <Link href={ROUTES.HOME} className="flex items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 border-muted-foreground/20 hover:bg-muted"
              >
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {locale === 'ko' ? '한국어' : 'English'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setLocale('ko')} 
                className={locale === 'ko' ? 'bg-accent font-medium' : ''}
              >
                한국어
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLocale('en')} 
                className={locale === 'en' ? 'bg-accent font-medium' : ''}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href={ROUTES.LOGIN}>{t('auth.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
