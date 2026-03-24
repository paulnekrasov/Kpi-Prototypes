import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles | KPI Admin",
  description: "Manage members, access levels, and review suggestions for owner, admin, and moderator workflows.",
};

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
