import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
    <html lang="uk" suppressHydrationWarning>
      <body className={`${onest.className} ${onest.variable} ${unbounded.variable}`}>
        <Providers>
          <div className="page-wrapper">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
