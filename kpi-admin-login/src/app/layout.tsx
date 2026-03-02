import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BackNavigation } from "@/components/BackNavigation";

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

import { Header } from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${onest.className} ${onest.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="layout-wrapper">
            <Header />
            <div className="layout-split">
              <div className="layout-illustration-side">
                <div className="illustration-wrapper">
                  <img src="/animated-logo.svg" alt="Animated Logo" className="animated-logo" />
                </div>
              </div>
              <div className="layout-form-side">
                <BackNavigation />
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

