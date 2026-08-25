import Link from "next/link";
import { WarningCircle, ShoppingCart, Bell } from "@phosphor-icons/react/dist/ssr";

interface AttentionItem {
  id: string;
  title: string;
  href: string;
  kind: "reminder" | "payment";
}

export function AttentionCard({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Cosas que necesitan atención"
      className="rounded-[var(--radius-xl)] border border-danger/20 bg-danger-soft p-4"
    >
      <div className="flex items-center gap-2">
        <WarningCircle weight="fill" size={18} className="shrink-0 text-danger" aria-hidden />
        <h2 className="text-sm font-semibold text-danger">Atención</h2>
      </div>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map((item) => {
          const Icon = item.kind === "payment" ? ShoppingCart : Bell;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex min-h-[36px] items-center gap-2.5 rounded-lg text-sm font-medium text-brown hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <Icon weight="regular" size={15} className="shrink-0 text-danger" aria-hidden />
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
