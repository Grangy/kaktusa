"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";

const CHAT_SESSION_KEY = "kaktusa_chat_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let s = localStorage.getItem(CHAT_SESSION_KEY);
  if (!s) {
    s = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CHAT_SESSION_KEY, s);
  }
  return s;
}

interface ChatConfig {
  enabled: boolean;
  workStartMsk: string;
  workEndMsk: string;
  available: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  fromAdmin: boolean;
  createdAt: string;
}

export function MiniChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/config");
      if (r.ok) setConfig(await r.json());
      else setConfig({ enabled: false, workStartMsk: "09:00", workEndMsk: "21:00", available: false });
    } catch {
      setConfig({ enabled: false, workStartMsk: "09:00", workEndMsk: "21:00", available: false });
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      const r = await fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}`);
      if (r.ok) {
        const data = await r.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    }
  }, [sessionId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (!open || !sessionId) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, sessionId, fetchMessages]);

  useEffect(() => {
    if (messages.length) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !sessionId || !config?.available || sending) return;
    setSending(true);
    setInput("");
    try {
      const r = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sessionId }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        setMessages((prev) => [
          ...prev,
          { id: data.id ?? "tmp", text, fromAdmin: false, createdAt: new Date().toISOString() },
        ]);
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  const available = config?.available ?? false;
  const hoursText =
    config?.workStartMsk && config?.workEndMsk
      ? `Чат доступен с ${config.workStartMsk} до ${config.workEndMsk} (МСК)`
      : "Чат временно недоступен";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9998] w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--accent)] text-black shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45),0_0_14px_-1px_rgba(145,145,145,0.4)] flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 md:bottom-28 md:right-8 left-6 md:left-auto md:w-[380px] z-[9999] rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl flex flex-col max-h-[min(70vh,420px)]"
          role="dialog"
          aria-label="Мини-чат"
        >
          <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
            <span className="font-display text-sm uppercase text-white/90">Чат</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 md:hidden"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
          </div>

          {!available ? (
            <div className="p-4 text-center text-white/60 text-sm">{hoursText}</div>
          ) : (
            <>
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px]"
              >
                {messages.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-4">Напишите сообщение — мы ответим в Telegram.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.fromAdmin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                          m.fromAdmin
                            ? "bg-white/10 text-white/90"
                            : "bg-[var(--accent)]/20 text-white border border-[var(--accent)]/30"
                        }`}
                      >
                        {m.fromAdmin && (
                          <span className="block text-[10px] uppercase text-[var(--accent)]/80 mb-0.5">Ответ</span>
                        )}
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Сообщение..."
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[var(--accent)]"
                  maxLength={2000}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-2.5 rounded-xl bg-[var(--accent)] text-black disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:opacity-90 transition-opacity"
                  aria-label="Отправить"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
