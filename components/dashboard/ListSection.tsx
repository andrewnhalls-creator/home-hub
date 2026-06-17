import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ListSectionItem {
  id: string;
  title: string;
  meta?: string;
  badgeLabel?: string;
  badgeVariant?: "neutral" | "success" | "warning" | "danger" | "accent";
}

interface ListSectionProps {
  title: string;
  href: string;
  items: ListSectionItem[];
  emptyMessage?: string;
}

export function ListSection({ title, href, items, emptyMessage }: ListSectionProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Link
          href={href}
          className="flex items-center gap-0.5 text-sm font-medium text-terracotta hover:underline"
          aria-label={`Ver todo — ${title}`}
        >
          Ver todo
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyMessage ?? "Nada pendiente por ahora."}</p>
      ) : (
        <ul className="stagger-list mt-3 flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-1 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brown">{item.title}</p>
                {item.meta && <p className="text-xs text-muted">{item.meta}</p>}
              </div>
              {item.badgeLabel && (
                <Badge variant={item.badgeVariant ?? "neutral"} className="shrink-0">
                  {item.badgeLabel}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
