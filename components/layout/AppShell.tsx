import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import type { NotificationEvent } from "@/lib/types";

interface AppShellProps {
  householdName?: string;
  notifications?: NotificationEvent[];
  unreadCount?: number;
  children: ReactNode;
}

export function AppShell({ householdName, notifications, unreadCount, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar householdName={householdName} notifications={notifications} unreadCount={unreadCount} />
        <OfflineBanner />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
