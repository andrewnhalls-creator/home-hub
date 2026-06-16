import Link from "next/link";
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
  emptyMessage: string;
}

export function ListSection({ title, href, items, emptyMessage }: ListSectionProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Link href={href} className="text-sm font-medium text-terracotta">
          Ver todo
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-brown">{item.title}</p>
                {item.meta && <p className="text-xs text-muted">{item.meta}</p>}
              </div>
              {item.badgeLabel && (
                <Badge variant={item.badgeVariant ?? "neutral"}>{item.badgeLabel}</Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
