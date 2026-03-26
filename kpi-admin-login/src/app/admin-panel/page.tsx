import Link from "next/link";

const PANELS = [
  {
    name: "owner-admin-moderator",
    route: "/admin-panel/owner-admin-moderator",
    status: "Ready",
    notes: "Mounted from admin-panel/owner-admin-moderator/roles-page.tsx",
  },
  {
    name: "analytics",
    route: "/admin-panel/analytics",
    status: "Pending",
    notes: "No page file found yet in admin-panel/analytics.",
  },
  {
    name: "media",
    route: "/admin-panel/media",
    status: "Pending",
    notes: "No page file found yet in admin-panel/media.",
  },
] as const;

export default function AdminPanelIndexPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
          Prototype Launcher
        </p>
        <h1 className="text-3xl font-semibold text-(--text-primary)">Admin Panel Routes</h1>
        <p className="max-w-2xl text-sm text-(--text-muted)">
          This host page mounts runnable prototypes from the `admin-panel` directory inside
          the Next.js app.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {PANELS.map((panel) => (
          <article
            key={panel.name}
            className="rounded-2xl border border-(--color-border-subtle) bg-(--surface-elevated) p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--text-primary)">{panel.name}</h2>
              <span className="rounded-full border border-(--color-border-subtle) px-2 py-1 text-xs text-(--text-muted)">
                {panel.status}
              </span>
            </div>

            <p className="mb-4 text-sm text-(--text-muted)">{panel.notes}</p>

            <Link
              href={panel.route}
              className="inline-flex items-center rounded-xl border border-(--color-border-subtle) px-3 py-2 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--surface-subtle)"
            >
              Open route
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
