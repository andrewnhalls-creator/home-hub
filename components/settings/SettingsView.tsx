import Link from "next/link";
import { SignOut, Bell, CaretRight, DeviceMobile, Tag, Shield, User, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HouseholdNameForm } from "@/components/settings/HouseholdNameForm";
import { ProfileNameForm } from "@/components/settings/ProfileNameForm";
import { InviteSection } from "@/components/settings/InviteSection";
import { HouseholdsSection } from "@/components/settings/HouseholdsSection";
import { signOut } from "@/app/auth/actions";
import type { HouseholdRole, HouseholdInvite, Profile } from "@/lib/types";

interface SettingsHousehold {
  name: string;
  locale: string;
  currency: string;
}

interface SettingsMember {
  id: string;
  user_id: string;
  role: HouseholdRole;
  display_name: string | null;
  created_at: string;
}

interface UserHousehold {
  household_id: string;
  role: HouseholdRole;
  households: { name: string } | null;
}

interface SettingsViewProps {
  household: SettingsHousehold;
  members: SettingsMember[];
  profile: Profile | null;
  currentUserId: string;
  role: HouseholdRole;
  initialInvite: HouseholdInvite | null;
  allMemberships: UserHousehold[];
  activeHouseholdId: string;
}

export function SettingsView({
  household,
  members,
  profile,
  currentUserId,
  role,
  initialInvite,
  allMemberships,
  activeHouseholdId,
}: SettingsViewProps) {
  const MEMBER_ACCENTS = ["bg-amber", "bg-sage", "bg-olive", "bg-rose", "bg-terracotta"];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brown">Ajustes</h1>
        <p className="mt-1 text-sm text-muted">Tu hogar, tu perfil y tus preferencias.</p>
      </div>

      {allMemberships.length > 1 && (
        <Card>
          <CardTitle>Mis hogares</CardTitle>
          <CardDescription>Cambia entre tus hogares o añade uno nuevo.</CardDescription>
          <div className="mt-3">
            <HouseholdsSection
              memberships={allMemberships}
              activeHouseholdId={activeHouseholdId}
            />
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Hogar</CardTitle>
        <CardDescription>Nombre compartido por todos los miembros.</CardDescription>
        <div className="mt-3">
          <HouseholdNameForm name={household.name} canEdit={role === "owner"} />
        </div>
        <div className="mt-4 flex gap-4 text-sm text-muted">
          <span>Idioma: {household.locale}</span>
          <span>Moneda: {household.currency}</span>
        </div>
      </Card>

      <Card>
        <CardTitle>Miembros</CardTitle>
        <CardDescription>Personas con acceso a este hogar.</CardDescription>
        <ul className="mt-3 flex flex-col gap-2.5">
          {members.map((member, index) => {
            const name = member.display_name || "Sin nombre";
            return (
              <li key={member.id} className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-cream ${MEMBER_ACCENTS[index % MEMBER_ACCENTS.length]}`}
                  aria-hidden
                >
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-brown">
                  {name}
                  {member.user_id === currentUserId && <span className="text-muted"> (tú)</span>}
                </span>
                <Badge variant={member.role === "owner" ? "accent" : "neutral"}>
                  {member.role === "owner" ? "Admin" : "Miembro"}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card>

      {role === "owner" && members.length < 5 && (
        <Card>
          <CardTitle>Añadir miembro</CardTitle>
          <CardDescription>Comparte este código para que alguien se una a tu hogar.</CardDescription>
          <div className="mt-3">
            <InviteSection initialInvite={initialInvite} />
          </div>
        </Card>
      )}

      {allMemberships.length === 1 && (
        <Card>
          <CardTitle>Mis hogares</CardTitle>
          <CardDescription>Añade otro hogar o únete a uno con un código.</CardDescription>
          <div className="mt-3">
            <HouseholdsSection
              memberships={allMemberships}
              activeHouseholdId={activeHouseholdId}
            />
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Tu perfil</CardTitle>
        <CardDescription>Tu nombre tal como te verán los demás miembros.</CardDescription>
        <div className="mt-3">
          <ProfileNameForm displayName={profile?.display_name ?? ""} />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden divide-y divide-sand">
        {[
          { href: "/ajustes/instalar", icon: DownloadSimple, label: "Instalar la app" },
          { href: "/ajustes/notificaciones", icon: Bell, label: "Notificaciones" },
          { href: "/ajustes/dispositivos", icon: DeviceMobile, label: "Dispositivos" },
          { href: "/ajustes/categorias", icon: Tag, label: "Categorías" },
          { href: "/ajustes/privacidad", icon: Shield, label: "Privacidad y datos" },
          { href: "/ajustes/cuenta", icon: User, label: "Cuenta" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-sm text-brown transition hover:bg-sand active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-terracotta" aria-hidden />
              {label}
            </span>
            <CaretRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        ))}
      </Card>

      <Card>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10"
          >
            <SignOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </Card>
    </div>
  );
}
