import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@/auth";
import Link from "next/link";
import { LayoutDashboard, Calendar, FileText, Tag, ExternalLink } from "lucide-react";
import { AdminToastProvider } from "@/components/admin/ToastProvider";
import { RevalidateCacheButton } from "@/components/admin/RevalidateCacheButton";

export const metadata: Metadata = {
  title: "Админ",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col md:flex-row">
        {session?.user ? (
          <>
            <aside className="w-full md:w-56 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
            <div className="p-4 border-b border-white/10">
              <Link
                href="/admin"
                className="font-display text-lg font-bold uppercase tracking-wide text-white hover:text-[var(--accent)] transition-colors"
              >
                ?КАКТУСА
              </Link>
              <span className="block text-[10px] uppercase text-white/50 mt-0.5">Admin</span>
            </div>
            <nav className="p-3 space-y-0.5">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <LayoutDashboard size={18} className="shrink-0" />
                Главная
              </Link>
              <Link
                href="/admin/events"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <Calendar size={18} className="shrink-0" />
                Мероприятия
              </Link>
              <Link
                href="/admin/main"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <FileText size={18} className="shrink-0" />
                Главная страница
              </Link>
              <Link
                href="/admin/meta"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <Tag size={18} className="shrink-0" />
                Метатеги
              </Link>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <ExternalLink size={18} className="shrink-0" />
                Сайт →
              </a>
              <div className="pt-2 mt-2 border-t border-white/10">
                <RevalidateCacheButton />
              </div>
              <div className="hidden md:block pt-4 mt-4 border-t border-white/10 space-y-3">
                <Image
                  src="/photos/image_1772103405970.png"
                  alt="КАКТУСА"
                  width={128}
                  height={128}
                  className="w-full max-w-32 mx-auto rounded-lg object-cover"
                />
                <a
                  href="https://github.com/Grangy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[10px] text-white/50 hover:text-[var(--accent)] transition-colors"
                >
                  by Grangy 2026 with love &lt;3
                </a>
              </div>
            </nav>
          </aside>
            <div className="flex-1 flex flex-col min-h-0">
              <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
              {children}
              </main>
              <footer className="md:hidden shrink-0 p-4 border-t border-white/10 flex flex-col items-center gap-2">
                <Image
                  src="/photos/image_1772103405970.png"
                  alt="КАКТУСА"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <a
                  href="https://github.com/Grangy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-white/50 hover:text-[var(--accent)] transition-colors"
                >
                  by Grangy 2026 with love &lt;3
                </a>
              </footer>
            </div>
          </>
        ) : (
          <main className="flex-1 flex items-center justify-center">{children}</main>
        )}
      </div>
    </AdminToastProvider>
  );
}
