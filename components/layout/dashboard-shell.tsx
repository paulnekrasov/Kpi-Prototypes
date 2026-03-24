"use client";

import React, { startTransition } from "react";
import {
  ChartBar,
  ChatCircleDots,
  HouseLine,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@components/layout/sidebar";
import { ThemeToggle } from "@components/providers/ThemeToggle";
import { Badge } from "@components/ui/Badge";
import { SidebarTab } from "@components/ui/sidebar-tab";

interface DashboardShellProps {
  children: React.ReactNode;
}

function setSearchParam(
  pathname: string,
  searchParams: URLSearchParams,
  key: string,
  value: string,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set(key, value);

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "suggestions" ? "suggestions" : "members";

  const navigateToRolesTab = (tab: "members" | "suggestions") => {
    if (pathname !== "/roles") {
      router.push(`/roles?tab=${tab}`);
      return;
    }

    startTransition(() => {
      router.replace(
        setSearchParam(pathname, new URLSearchParams(searchParams.toString()), "tab", tab),
        { scroll: false },
      );
    });
  };

  return (
    <div className="min-h-screen bg-(--bg-subtle)">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="hidden border-r border-(--border-subtle-plus) lg:flex">
          <Sidebar defaultCollapsed={false}>
            <div className="sidebar-upper">
              <Sidebar.Header teamName="KPI Admin" />
              <Sidebar.Nav>
                <SidebarTab
                  active={false}
                  disabled
                  icon={<HouseLine size={16} weight="bold" />}
                  label="Home"
                />
                <SidebarTab
                  active={pathname === "/roles" && activeTab === "members"}
                  icon={<ShieldCheck size={16} weight="bold" />}
                  label="Roles"
                  onClick={() => navigateToRolesTab("members")}
                />
                <SidebarTab
                  active={pathname === "/roles" && activeTab === "suggestions"}
                  icon={<ChatCircleDots size={16} weight="bold" />}
                  label="Suggestions"
                  onClick={() => navigateToRolesTab("suggestions")}
                />
                <SidebarTab
                  active={false}
                  disabled
                  icon={<ChartBar size={16} weight="bold" />}
                  label="Analytics"
                />
              </Sidebar.Nav>
            </div>
            <Sidebar.Footer
              userName="Paul Nekrasov"
              userRole="Owner controls"
            />
          </Sidebar>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-(--border-subtle-plus) bg-(--bg-subtle)/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                  Owner / Admin / Moderator
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <h1 className="text-sm font-semibold text-(--text-primary)">Admin Control Center</h1>
                  <Badge variant="brand" size="sm">
                    Prototype build
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="neutral" className="hidden sm:inline-flex">
                  <Sparkle size={12} weight="bold" aria-hidden="true" />
                  <span className="ml-1">Token-first shell</span>
                </Badge>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
