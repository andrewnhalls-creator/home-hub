import { requireHousehold } from "@/lib/auth";
import { PrivacidadView } from "@/components/settings/PrivacidadView";

export default async function PrivacidadPage() {
  await requireHousehold();
  return <PrivacidadView />;
}
