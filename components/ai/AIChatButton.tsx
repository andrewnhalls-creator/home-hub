"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkle, PaperPlaneTilt } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Hola, soy tu asistente del hogar. Puedo ayudarte con la lista de la compra, recordatorios, gastos, menús y mucho más. ¿En qué puedo ayudarte?";

export function AIChatButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const prevHistory = history;
    setHistory((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: prevHistory.slice(-10) }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error((err as { error?: string }).error ?? "Error al contactar el asistente");
      }

      const data = (await res.json()) as { message: string; actionsExecuted: number };
      setHistory((prev) => [...prev, { role: "assistant", content: data.message }]);

      if (data.actionsExecuted > 0) {
        router.refresh();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al contactar el asistente", "error");
      setHistory(prevHistory);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, history, router, showToast]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showGreeting = history.length === 0 && !loading;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir asistente del hogar"
        className="fixed bottom-20 right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-terracotta text-cream shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 focus-visible:ring-offset-2 active:scale-95 md:bottom-8 md:right-6"
      >
        <Sparkle weight="fill" className="h-6 w-6" aria-hidden />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Asistente del hogar" className="sm:max-w-lg">
        <div className="flex flex-col gap-3">
          {/* Message history */}
          <div className="flex h-72 flex-col gap-3 overflow-y-auto pr-1 sm:h-80">
            {showGreeting && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.07] px-4 py-3 text-sm leading-relaxed text-brown">
                  {GREETING}
                </div>
              </div>
            )}
            {history.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-terracotta text-cream"
                      : "rounded-tl-sm bg-white/[0.07] text-brown",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.07] px-4 py-3 text-sm text-muted">
                  <span className="animate-pulse">Pensando…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2">
            <label htmlFor="ai-chat-input" className="sr-only">
              Escribe un mensaje
            </label>
            <input
              ref={inputRef}
              id="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Escribe un mensaje…"
              className="min-h-[44px] flex-1 rounded-[var(--radius-xl)] border border-border bg-white/[0.06] px-3 py-2.5 text-sm text-brown placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-terracotta/70 focus:outline-none focus:ring-1 focus:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              <PaperPlaneTilt weight="fill" className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
