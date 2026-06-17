import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}

export function SummaryCard({ icon: Icon, label, value, href }: SummaryCardProps) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 transition-colors hover:bg-sand active:bg-sand">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold text-brown">{value}</p>
          <p className="text-sm text-muted">{label}</p>
        </div>
      </Card>
    </Link>
  );
}
