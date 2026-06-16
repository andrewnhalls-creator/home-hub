import { requireHousehold } from "@/lib/auth";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export default async function DashboardPage() {
  const { householdName } = await requireHousehold();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>Hola</CardTitle>
        <CardDescription>Resumen de {householdName}</CardDescription>
      </Card>
    </div>
  );
}
