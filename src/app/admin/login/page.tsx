"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertBanner } from "@/components/admin/AlertBanner";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Неверный пароль");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-white/15 bg-white/[0.02] p-8 shadow-xl"
      >
        <h1 className="font-display text-xl font-bold uppercase text-white mb-6">
          Вход в админку
        </h1>
        {error && (
          <div className="mb-4">
            <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />
          </div>
        )}
        <label className="block text-white/80 text-sm mb-2">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white mb-6 focus:outline-none focus:border-[var(--accent)]"
          required
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--accent)] text-black font-display text-sm font-semibold uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
