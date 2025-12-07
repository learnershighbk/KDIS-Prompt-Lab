'use client';

import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/features/i18n/stores/locale.store';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    const stored = localStorage.getItem('locale-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.locale && parsed.state.locale !== locale) {
          setLocale(parsed.state.locale);
        }
      } catch {
        // ignore
      }
    }
    setIsHydrated(true);
  }, [locale, setLocale]);

  useEffect(() => {
    if (isHydrated) {
      document.documentElement.lang = locale;
    }
  }, [locale, isHydrated]);

  return <>{children}</>;
}

