import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-8">Админ-панель</h1>
      <div className="grid gap-4 max-w-md">
        <Link
          href="/admin/events"
          className="block p-6 border border-white/20 hover:border-[var(--accent)] transition-colors"
        >
          <h2 className="font-display text-lg font-bold uppercase mb-1">Мероприятия</h2>
          <p className="text-white/60 text-sm">Создание и редактирование ивентов, фото, билеты</p>
        </Link>
        <Link
          href="/admin/main"
          className="block p-6 border border-white/20 hover:border-[var(--accent)] transition-colors"
        >
          <h2 className="font-display text-lg font-bold uppercase mb-1">Главная страница</h2>
          <p className="text-white/60 text-sm">Hero, о проекте, галерея, отзывы</p>
        </Link>
        <Link
          href="/admin/meta"
          className="block p-6 border border-white/20 hover:border-[var(--accent)] transition-colors"
        >
          <h2 className="font-display text-lg font-bold uppercase mb-1">Метатеги</h2>
          <p className="text-white/60 text-sm">Title, description, canonical для SEO</p>
        </Link>
        <Link
          href="/admin/chat"
          className="block p-6 border border-white/20 hover:border-[var(--accent)] transition-colors"
        >
          <h2 className="font-display text-lg font-bold uppercase mb-1">Чат и Telegram</h2>
          <p className="text-white/60 text-sm">Мини-чат на сайте, бот, время работы (МСК)</p>
        </Link>
      </div>
    </div>
  );
}
