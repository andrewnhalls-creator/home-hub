import { requireHousehold } from "@/lib/auth";
import { InstallGuideView } from "@/components/settings/InstallGuideView";

export default async function InstallPage() {
  await requireHousehold();
  return <InstallGuideView />;
}
