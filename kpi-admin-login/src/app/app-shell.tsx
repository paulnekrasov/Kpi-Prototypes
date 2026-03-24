"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Header } from "@components/layout/Header";
import { DashboardShell } from "@components/layout/dashboard-shell";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/roles");

  if (isDashboardRoute) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <div className="layout-wrapper">
      <Header />
      <div className="layout-split">
        <div className="layout-illustration-side">
          <div className="illustration-wrapper">
            <Image
              src="/fixed-animated-logo.svg"
              alt="Анімований логотип Студради КПІ"
              className="animated-logo"
              width={400}
              height={400}
              priority
              unoptimized
            />
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
  );
}
