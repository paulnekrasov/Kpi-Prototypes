import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--bg-subtle)">
      <h1 className="font-(family-name:--font-display) text-4xl font-bold text-(--text-primary)">
        404
      </h1>
      <p className="text-(--text-muted)">Сторінку не знайдено.</p>
      <Link
        href="/"
        className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2"
      >
        На головну
      </Link>
    </div>
  );
}
