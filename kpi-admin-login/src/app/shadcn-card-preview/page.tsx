import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/Button";

export default function ShadcnCardPreviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-(--text-primary)">
        shadcn Card Preview
      </h1>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Team Performance Snapshot</CardTitle>
            <CardDescription>
              This is the shadcn Card structure adapted to your token system.
            </CardDescription>
          </div>
          <CardAction>
            <span className="rounded-full border border-(--status-success-border) bg-(--status-success-bg) px-3 py-1 text-xs font-medium text-(--color-success)">
              Healthy
            </span>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 text-sm text-(--text-muted) sm:grid-cols-3">
            <div className="rounded-xl border border-(--border-subtle-plus) bg-(--bg-subtle) p-3">
              <p className="text-(--text-subtle)">Active users</p>
              <p className="mt-1 text-lg font-semibold text-(--text-primary)">2,194</p>
            </div>
            <div className="rounded-xl border border-(--border-subtle-plus) bg-(--bg-subtle) p-3">
              <p className="text-(--text-subtle)">Conversion</p>
              <p className="mt-1 text-lg font-semibold text-(--text-primary)">12.8%</p>
            </div>
            <div className="rounded-xl border border-(--border-subtle-plus) bg-(--bg-subtle) p-3">
              <p className="text-(--text-subtle)">Revenue</p>
              <p className="mt-1 text-lg font-semibold text-(--text-primary)">$14,290</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button variant="secondary">Dismiss</Button>
          <Button>Open Report</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
