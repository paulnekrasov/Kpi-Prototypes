"use client";

import React, { startTransition } from "react";
import { ShieldCheck } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@components/layout/sidebar";
import { SidebarTab } from "@components/ui/sidebar-tab";

interface DashboardShellProps {
  children: React.ReactNode;
}

const ROLES_PATH = "/admin-panel/owner-admin-moderator";
const ROLE_OPTIONS = ["owner", "admin", "moderator"] as const;
type RoleOption = (typeof ROLE_OPTIONS)[number];

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
  const currentRole = searchParams.get("role");
  const activeRole: RoleOption = ROLE_OPTIONS.includes(currentRole as RoleOption)
    ? (currentRole as RoleOption)
    : "owner";

  const navigateToRole = (role: RoleOption) => {
    if (pathname !== ROLES_PATH) {
      router.push(`${ROLES_PATH}?role=${role}`);
      return;
    }

    startTransition(() => {
      router.replace(
        setSearchParam(pathname, new URLSearchParams(searchParams.toString()), "role", role),
        { scroll: false },
      );
    });
  };

  const roleLabel = activeRole.charAt(0).toUpperCase() + activeRole.slice(1);

  return (
    <div className="min-h-screen bg-(--bg-subtle)">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="hidden border-r border-(--border-subtle-plus) lg:flex">
          <Sidebar defaultCollapsed={false}>
            <Sidebar.Content>
              <Sidebar.Nav>
                <SidebarTab
                  active={pathname === ROLES_PATH && activeRole === "owner"}
                  icon={<ShieldCheck size={16} weight="bold" />}
                  label="Owner"
                  onClick={() => navigateToRole("owner")}
                />
                <SidebarTab
                  active={pathname === ROLES_PATH && activeRole === "admin"}
                  icon={<ShieldCheck size={16} weight="bold" />}
                  label="Admin"
                  onClick={() => navigateToRole("admin")}
                />
                <SidebarTab
                  active={pathname === ROLES_PATH && activeRole === "moderator"}
                  icon={<ShieldCheck size={16} weight="bold" />}
                  label="Moderator"
                  onClick={() => navigateToRole("moderator")}
                />
              </Sidebar.Nav>
            </Sidebar.Content>
          </Sidebar>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-(--border-subtle-plus) bg-(--bg-subtle)/95 backdrop-blur-sm">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                Role Dashboard
              </p>
              <h1 className="mt-1 text-base font-semibold text-(--text-primary)">
                {roleLabel} Access
              </h1>
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
