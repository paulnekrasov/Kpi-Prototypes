import { Suspense } from "react";
import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import "@styles/tokens.css";
import "./globals.css";
import { Providers } from "@components/providers/Providers";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Адмін панель СР КПІ",
  description: "Панель управління Студентської Ради КПІ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${onest.className} ${onest.variable} ${unbounded.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="theme-color"
          content="#f3f5fa"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#05050f"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <a href="#main-content" className="skip-to-content">
            Перейти до контенту
          </a>
          <Suspense>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
