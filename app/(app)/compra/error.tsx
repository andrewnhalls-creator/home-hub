"use client";
import { ModuleError } from "@/components/ui/ModuleError";
export default function Error({ reset }: { reset: () => void }) {
  return <ModuleError reset={reset} />;
}
