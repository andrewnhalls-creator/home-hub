"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { generateInviteCode } from "@/app/(app)/ajustes/actions";

interface InviteSectionProps {
  initialCode: string | null;
  initialExpiresAt: string | null;
}

export function InviteSection({ initialCode, initialExpiresAt }: InviteSectionProps) {
  const [code, setCode] = useState(initialCode);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [error, setError] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(undefined);
    startTransition(async () => {
      const result = await generateInviteCode();
      if (result.error) {
        setError(result.error);
        return;
      }
      setCode(result.code ?? null);
      setExpiresAt(result.expiresAt ?? null);
    });
  }

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {code ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-terracotta bg-terracotta/5 px-4 py-3">
            <KeyRound className="h-4 w-4 text-terracotta" aria-hidden />
            <span className="flex-1 font-mono text-lg tracking-widest text-brown">{code}</span>
            <button
              type="button"
              aria-label="Copiar código"
              onClick={handleCopy}
              className="flex h-9 w-9 items-center justify-center rounded-full text-terracotta hover:bg-terracotta/10"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            </button>
          </div>
          {expiresAt && (
            <p className="text-xs text-muted">Caduca el {formatDate(expiresAt)}.</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">Genera un código para invitar a alguien a este hogar.</p>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="button" variant="secondary" onClick={handleGenerate} isLoading={isPending}>
        {code ? "Generar nuevo código" : "Generar código de invitación"}
      </Button>
    </div>
  );
}
