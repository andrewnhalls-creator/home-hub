import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { PageTransition } from "@/components/layout/PageTransition";
import type { NotificationEvent } from "@/lib/types";

interface AppShellProps {
  householdName?: string;
  notifications?: NotificationEvent[];
  unreadCount?: number;
  children: ReactNode;
}

export function AppShell({ householdName, notifications, unreadCount, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh [overflow-x:clip] bg-cream">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brown focus:shadow-card"
      >
        Ir al contenido principal
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar householdName={householdName} notifications={notifications} unreadCount={unreadCount} />
        <OfflineBanner />
        <main id="main-content" className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-6">
          <div className="mx-auto w-full max-w-3xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
