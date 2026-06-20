"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkle,
  PaperPlaneTilt,
  ChatCircle,
  Lightning,
  CheckCircle,
  Warning,
  Question,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// Mirror of AssistantResult from lib/ai/action-schema — kept here to avoid bundling Zod on the client
interface AssistantResult {
  action: string;
  payload: Record<string, unknown>;
  requiresConfirmation: boolean;
  confidence: number;
  clarifyingQuestion: string | null;
}

type CmdPhase = "idle" | "loading" | "clarify" | "confirm" | "executing" | "success" | "unavailable";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Hola, soy tu asistente del hogar. Puedo ayudarte con la lista de la compra, recordatorios, gastos, menús y mucho más. ¿En qué puedo ayudarte?";

function describeAction(result: AssistantResult): string {
  const { action, payload } = result;
  switch (action) {
    case "add_shopping_item":
      return `Añadir "${payload.item}" a la lista de la compra${payload.quantity ? ` (${payload.quantity})` : ""}`;
    case "update_shopping_item":
      return `Actualizar "${payload.item}" en la lista de la compra`;
    case "remove_shopping_item":
      return `Eliminar "${payload.item}" de la lista de la compra`;
    case "add_task":
      return `Crear tarea: "${payload.title}"`;
    case "update_task":
      return `Actualizar tarea: "${payload.title}"`;
    case "complete_task":
      return `Marcar como completada: "${payload.title}"`;
    case "add_reminder":
      return `Crear recordatorio: "${payload.title}"`;
    case "update_reminder":
      return `Actualizar recordatorio: "${payload.title}"`;
    default:
      return action;
  }
}

// ─── Chat mode ────────────────────────────────────────────────────────────────

function ChatMode() {
  const router = useRouter();
  const { showToast } = useToast();
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

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
      if (data.actionsExecuted > 0) router.refresh();
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
    <div className="flex flex-col gap-3">
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
  );
}

// ─── Command mode ─────────────────────────────────────────────────────────────

function CommandMode() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<CmdPhase>("idle");
  const [parsedResult, setParsedResult] = useState<AssistantResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "idle" || phase === "clarify") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  const reset = () => {
    setPhase("idle");
    setParsedResult(null);
    setInput("");
    setError("");
  };

  const parse = async () => {
    const text = input.trim();
    if (!text || phase === "loading" || phase === "executing") return;
    setPhase("loading");
    setError("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json()) as { ok: boolean; result?: AssistantResult; error?: string };
      if (!data.ok || !data.result) throw new Error(data.error ?? "Error al procesar");

      const result = data.result;
      setParsedResult(result);
      setPhase(result.action === "clarify" ? "clarify" : "confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al contactar el asistente");
      setPhase("idle");
    }
  };

  const execute = async () => {
    if (!parsedResult || phase === "executing") return;
    setPhase("executing");
    setError("");

    try {
      const res = await fetch("/api/assistant/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: parsedResult }),
      });
      const data = (await res.json()) as { ok: boolean; executed?: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Error al ejecutar");

      if (data.executed) {
        setPhase("success");
        router.refresh();
      } else {
        setPhase("unavailable");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar la acción");
      setPhase("confirm");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      parse();
    }
  };

  const isBusy = phase === "loading" || phase === "executing";

  return (
    <div className="flex flex-col gap-4">
      {/* Clarify card */}
      {phase === "clarify" && parsedResult && (
        <div className="flex items-start gap-3 rounded-xl border border-amber/30 bg-amber/[0.08] p-4">
          <Question weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
          <p className="text-sm leading-relaxed text-brown/80">{parsedResult.clarifyingQuestion}</p>
        </div>
      )}

      {/* Action preview */}
      {(phase === "confirm" || phase === "executing") && parsedResult && (
        <div
          className={cn(
            "rounded-xl border p-4",
            parsedResult.requiresConfirmation
              ? "border-amber/30 bg-amber/[0.08]"
              : "border-white/[0.10] bg-white/[0.04]",
          )}
        >
          {parsedResult.requiresConfirmation && (
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber">
              <Warning weight="fill" className="h-3.5 w-3.5" aria-hidden />
              Confirmar acción
            </p>
          )}
          <p className="text-sm text-brown">{describeAction(parsedResult)}</p>
          {parsedResult.requiresConfirmation && (
            <p className="mt-1.5 text-xs text-muted">Esta acción puede ser difícil de deshacer.</p>
          )}
        </div>
      )}

      {/* Success */}
      {phase === "success" && parsedResult && (
        <div className="flex items-start gap-3 rounded-xl border border-sage/30 bg-sage/[0.08] p-4">
          <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
          <p className="text-sm text-brown">¡Hecho! {describeAction(parsedResult)}.</p>
        </div>
      )}

      {/* Not yet wired */}
      {phase === "unavailable" && (
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
          <Sparkle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
          <p className="text-sm text-muted">Entendido. Esta acción estará disponible próximamente.</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-danger">{error}</p>}

      {/* Text input */}
      {(phase === "idle" || phase === "loading" || phase === "clarify") && (
        <>
          <div className="flex items-center gap-2">
            <label htmlFor="cmd-input" className="sr-only">
              Escribe un comando
            </label>
            <input
              ref={inputRef}
              id="cmd-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy}
              placeholder={
                phase === "clarify" ? "Escribe tu respuesta…" : "Ej: añadir leche a la compra"
              }
              className="min-h-[44px] flex-1 rounded-[var(--radius-xl)] border border-border bg-white/[0.06] px-3 py-2.5 text-sm text-brown placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-terracotta/70 focus:outline-none focus:ring-1 focus:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <button
              type="button"
              onClick={parse}
              disabled={isBusy || !input.trim()}
              aria-label="Enviar comando"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              {phase === "loading" ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream"
                  aria-hidden
                />
              ) : (
                <PaperPlaneTilt weight="fill" className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
          {phase === "idle" && (
            <p className="text-center text-xs text-muted">
              Añadir artículos · Crear recordatorios · Gestionar tareas
            </p>
          )}
        </>
      )}

      {/* Confirm / cancel */}
      {phase === "confirm" && parsedResult && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={execute}
            className={cn(
              "min-h-[44px] flex-1 rounded-[var(--radius-xl)] px-4 py-3 text-sm font-medium transition-colors",
              parsedResult.requiresConfirmation
                ? "border border-amber/40 bg-amber/[0.15] text-brown hover:bg-amber/[0.25]"
                : "bg-terracotta text-cream hover:bg-terracotta/90",
            )}
          >
            {parsedResult.requiresConfirmation ? "Confirmar de todas formas" : "Ejecutar"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="min-h-[44px] rounded-[var(--radius-xl)] border border-border bg-white/[0.04] px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-white/[0.08]"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Executing */}
      {phase === "executing" && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-muted/30 border-t-muted"
            aria-hidden
          />
          Ejecutando…
        </div>
      )}

      {/* Reset after terminal state */}
      {(phase === "success" || phase === "unavailable") && (
        <button
          type="button"
          onClick={reset}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-border bg-white/[0.04] px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-white/[0.08]"
        >
          <ArrowCounterClockwise className="h-4 w-4" aria-hidden />
          Nuevo comando
        </button>
      )}
    </div>
  );
}

// ─── Main FAB + modal ─────────────────────────────────────────────────────────

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "command">("chat");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir asistente del hogar"
        className="fixed right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-terracotta text-cream shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 focus-visible:ring-offset-2 active:scale-95 md:right-6"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <Sparkle weight="fill" className="h-6 w-6" aria-hidden />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Asistente del hogar"
        className="sm:max-w-lg"
      >
        {/* Mode toggle */}
        <div className="mb-4 flex rounded-xl bg-white/[0.05] p-1">
          <button
            type="button"
            onClick={() => setMode("chat")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === "chat" ? "bg-white/[0.10] text-brown" : "text-muted hover:text-brown/70",
            )}
          >
            <ChatCircle className="h-4 w-4" aria-hidden />
            Asistente
          </button>
          <button
            type="button"
            onClick={() => setMode("command")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === "command" ? "bg-white/[0.10] text-brown" : "text-muted hover:text-brown/70",
            )}
          >
            <Lightning className="h-4 w-4" aria-hidden />
            Comandos
          </button>
        </div>

        {mode === "chat" ? <ChatMode /> : <CommandMode />}
      </Modal>
    </>
  );
}
