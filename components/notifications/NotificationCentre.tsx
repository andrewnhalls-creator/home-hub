"use client";

import { useState, useTransition } from "react";
import { isToday, isYesterday, format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, CheckCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/format";
import { NOTIFICATION_CATEGORY_META } from "@/lib/notificationCategories";
import { markNotificationRead, markAllNotificationsRead } from "@/app/(app)/notificaciones/actions";
import { cn } from "@/lib/utils";
import type { NotificationEvent } from "@/lib/types";

interface NotificationCentreProps {
  notifications: NotificationEvent[];
  unreadCount: number;
}

function dayLabel(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  return format(date, "d 'de' MMMM", { locale: es });
}

function groupByDay(notifications: NotificationEvent[]): { label: string; items: NotificationEvent[] }[] {
  const groups: { label: string; items: NotificationEvent[] }[] = [];
  for (const notification of notifications) {
    const label = dayLabel(notification.created_at);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(notification);
    } else {
      groups.push({ label, items: [notification] });
    }
  }
  return groups;
}

export function NotificationCentre({ notifications, unreadCount }: NotificationCentreProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const groups = groupByDay(notifications);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
        onClick={() => setIsOpen(true)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-brown transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-medium text-cream">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notificaciones" className="sm:max-w-lg">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No tienes notificaciones."
            description="Aquí verás los avisos de recordatorios, pagos, calendario y más."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="flex items-center gap-1.5 self-end text-sm font-medium text-terracotta disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" aria-hidden />
                Marcar todo como leído
              </button>
            )}
            {groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{group.label}</p>
                <ul className="flex flex-col gap-2">
                  {group.items.map((notification) => {
                    const meta = NOTIFICATION_CATEGORY_META[notification.category];
                    const Icon = meta.icon;
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                          disabled={isPending}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-sand",
                            notification.is_read ? "opacity-60" : "bg-terracotta/8",
                          )}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-terracotta">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-brown">{notification.title}</span>
                            {notification.body && (
                              <span className="mt-0.5 block text-sm text-muted">{notification.body}</span>
                            )}
                            <span className="mt-1 block text-xs text-muted">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
