import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CuentaView } from "@/components/settings/CuentaView";

export default async function CuentaPage() {
  await requireHousehold();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <CuentaView email={user?.email ?? ""} />;
}
