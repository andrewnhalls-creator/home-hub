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
        "fixed bottom-20 right-4 z-30 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-medium text-cream shadow-md hover:bg-[#b35a3c] md:bottom-6",
        className,
      )}
    >
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
