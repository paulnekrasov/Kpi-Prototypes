import type { Metadata } from "next";
import Image from "next/image";
import { Onest, Unbounded } from "next/font/google";
import "@styles/tokens.css";
import "./globals.css";
import { Providers } from "@components/providers/Providers";
import { Header } from "@components/layout/Header";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Панель СР КПІ",
  description: "Адмін панель СР КПІ. Авторизація.",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${onest.className} ${onest.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f3f5fa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#05050f" media="(prefers-color-scheme: dark)" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <a href="#main-content" className="skip-to-content">Перейти до контенту</a>
          <div className="layout-wrapper">
            <Header />
            <div className="layout-split">
              <div className="layout-illustration-side">
                <div className="illustration-wrapper">
                  <Image src="/fixed-animated-logo.svg" alt="Анімований логотип Студради КПІ" className="animated-logo" width={400} height={400} priority unoptimized />
                </div>
              </div>
              <div className="layout-form-side" id="main-content">
                {children}
              </div>
            </div>
            <div className="footer-wrapper">
              <p className="footer-text">Обмежений доступ. Тільки для команди СР КПІ</p>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

