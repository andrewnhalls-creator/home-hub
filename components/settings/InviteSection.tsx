"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Key, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { generateInviteCode, revokeInvite } from "@/app/(app)/ajustes/actions";
import type { HouseholdInvite } from "@/lib/types";

interface InviteSectionProps {
  initialInvite: HouseholdInvite | null;
}

// The plaintext code exists only in this component's state right after
// generating it — the server stores a hash and cannot show it again.
export function InviteSection({ initialInvite }: InviteSectionProps) {
  const [activeInvite, setActiveInvite] = useState(initialInvite);
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [freshExpiresAt, setFreshExpiresAt] = useState<string | null>(null);
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
      setFreshCode(result.code ?? null);
      setFreshExpiresAt(result.expiresAt ?? null);
      setActiveInvite(null);
    });
  }

  function handleRevoke() {
    setError(undefined);
    startTransition(async () => {
      const result = activeInvite ? await revokeInvite(activeInvite.id) : {};
      if (result.error) {
        setError(result.error);
        return;
      }
      setActiveInvite(null);
      setFreshCode(null);
      setFreshExpiresAt(null);
    });
  }

  async function handleCopy() {
    if (!freshCode) return;
    await navigator.clipboard.writeText(freshCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {freshCode ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-terracotta bg-terracotta/5 px-4 py-3">
            <Key className="h-4 w-4 text-terracotta" aria-hidden />
            <span className="flex-1 font-mono text-lg tracking-widest text-brown">{freshCode}</span>
            <button
              type="button"
              aria-label="Copiar código"
              onClick={handleCopy}
              className="flex h-11 w-11 items-center justify-center rounded-full text-terracotta hover:bg-terracotta/10 active:bg-terracotta/10"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <WarningCircle className="h-4 w-4 shrink-0" aria-hidden />
            Guárdalo ahora: por seguridad no volverá a mostrarse.
            {freshExpiresAt && <> Caduca el {formatDate(freshExpiresAt)}.</>}
          </p>
        </div>
      ) : activeInvite ? (
        <p className="text-sm text-muted">
          Hay una invitación activa que caduca el {formatDate(activeInvite.expires_at)}. El
          código solo se muestra al generarlo; si lo habéis perdido, genera uno nuevo.
        </p>
      ) : (
        <p className="text-sm text-muted">Genera un código para invitar a alguien a este hogar.</p>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" onClick={handleGenerate} isLoading={isPending}>
          {freshCode || activeInvite ? "Generar nuevo código" : "Generar código de invitación"}
        </Button>
        {activeInvite && (
          <Button type="button" variant="ghost" onClick={handleRevoke} isLoading={isPending}>
            Revocar invitación
          </Button>
        )}
      </div>
    </div>
  );
}
