import { Card, CardTitle } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";

interface ActivityItem {
  id: string;
  summary: string | null;
  created_at: string;
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardTitle>Actividad reciente</CardTitle>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Todavía no hay actividad. Empieza añadiendo tu primera tarea, compra o pago.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <p className="text-brown">{item.summary}</p>
              <p className="text-xs text-muted">{formatDateTime(item.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
