import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { LocaleProvider } from '@/components/layouts/locale-provider';

export const metadata: Metadata = {
  title: "Prompt Lab - KDI School",
  description: "Socratic prompt engineering learning platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let currentUser;
  try {
    currentUser = await loadCurrentUser();
  } catch (error) {
    console.error("RootLayout에서 loadCurrentUser 실패:", error);
    currentUser = { status: "unauthenticated" as const, user: null };
  }

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <LocaleProvider>
            <CurrentUserProvider initialState={currentUser}>
              {children}
            </CurrentUserProvider>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
