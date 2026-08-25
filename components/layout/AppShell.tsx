import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { PageTransition } from "@/components/layout/PageTransition";
import { RealtimeSync } from "@/components/RealtimeSync";
import { AIChatButton } from "@/components/ai/AIChatButton";
import type { HouseholdOption } from "@/components/layout/HouseholdSwitchSheet";
import type { NotificationEvent } from "@/lib/types";

interface AppShellProps {
  householdId: string;
  householdName?: string;
  userName?: string;
  userRole?: "owner" | "member";
  households?: HouseholdOption[];
  notifications?: NotificationEvent[];
  unreadCount?: number;
  children: ReactNode;
}

export function AppShell({ householdId, householdName, userName, userRole, households, notifications, unreadCount, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh [overflow-x:clip] bg-cream">
      <RealtimeSync householdId={householdId} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brown focus:shadow-card"
      >
        Ir al contenido principal
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          householdName={householdName}
          userName={userName}
          userRole={userRole}
          households={households}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <OfflineBanner />
        <main id="main-content" className="flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:pb-6">
          <div className="mx-auto w-full max-w-3xl lg:max-w-5xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <BottomNav />
      <AIChatButton />
    </div>
  );
}
