import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingAddLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function FloatingAddLink({ href, label, className }: FloatingAddLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mt-4 inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-medium text-cream hover:bg-[#b35a3c]",
        className,
      )}
    >
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
