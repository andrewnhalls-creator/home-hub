"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, CaretRight, SignOut, X } from "@phosphor-icons/react";
import { MENU_ITEMS } from "@/lib/constants";
import { signOut } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  householdName?: string;
  userName?: string;
  userRole?: "owner" | "member";
}

export function AppDrawer({ isOpen, onClose, householdName, userName, userRole }: AppDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    drawerRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initial = (userName ?? "?").trim().charAt(0).toUpperCase() || "?";
  const roleLabel = userRole === "owner" ? "Admin" : "Miembro";

  return createPortal(
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="animate-backdrop-enter absolute inset-0 bg-black/40"
        style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        aria-hidden
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        onClick={(e) => e.stopPropagation()}
        className="animate-drawer-enter relative flex h-full w-[85%] max-w-sm flex-col rounded-r-[var(--radius-xl)] bg-card shadow-[var(--shadow-xl)]"
      >
        {/* Profile header */}
        <div className="flex items-center gap-3 border-b border-border px-5 pb-4 pt-[calc(1.25rem+env(safe-area-inset-top))]">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-lg font-bold text-terracotta"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            {userName && (
              <p className="truncate text-base font-bold text-terracotta">{userName}</p>
            )}
            <p className="text-sm text-muted">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]"
          >
            <X weight="light" size={18} aria-hidden />
          </button>
        </div>

        {/* Household pill — manage/switch households in Ajustes */}
        <div className="px-5 pt-5">
          <Link
            href="/ajustes"
            onClick={onClose}
            className="flex min-h-[52px] items-center gap-3 rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <House weight="regular" size={22} className="shrink-0 text-brown" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-base font-semibold text-brown">
              {householdName ?? "Tu casa"}
            </span>
            <CaretRight weight="bold" size={14} className="shrink-0 text-muted" aria-hidden />
          </Link>
        </div>

        {/* Module list */}
        <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/ajustes"
                  ? pathname === "/ajustes"
                  : pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-[48px] items-center gap-3.5 rounded-full px-4 py-2.5 text-[15px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                      isActive
                        ? "bg-terracotta font-semibold text-cream"
                        : "font-medium text-brown hover:bg-sand",
                    )}
                  >
                    <Icon
                      weight={isActive ? "fill" : "regular"}
                      size={22}
                      className={cn("shrink-0", isActive ? "text-cream" : "text-muted")}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="border-t border-border px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-[48px] w-full items-center gap-3.5 rounded-full px-4 py-2.5 text-[15px] font-medium text-danger transition hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger active:scale-[0.98]"
            >
              <SignOut weight="regular" size={22} aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
