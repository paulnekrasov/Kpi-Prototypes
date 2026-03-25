import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel Prototypes | KPI Admin",
  description:
    "Launch and preview admin-panel prototypes mounted inside the KPI Admin host app.",
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
