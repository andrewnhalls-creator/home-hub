import { cn } from "@/lib/utils";

export function Sk({ className }: { className?: string }) {
  return <div className={cn("motion-safe:animate-pulse rounded-xl bg-sand", className)} />;
}
