import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { requireHousehold } from "@/lib/auth";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const { householdName } = await requireHousehold();

  return <AppShell householdName={householdName}>{children}</AppShell>;
}
