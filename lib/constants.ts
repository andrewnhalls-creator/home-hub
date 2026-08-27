import {
  House,
  ShoppingCart,
  ForkKnife,
  Bell,
  BellRinging,
  ListChecks,
  CalendarDots,
  Wallet,
  FileText,
  Heart,
  GearSix,
  DeviceMobile,
  Trash,
  ClockClockwise,
  type Icon,
} from "@phosphor-icons/react";

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Inicio",       icon: House },
  { href: "/calendario",   label: "Calendario",   icon: CalendarDots },
  { href: "/compra",       label: "Compra",       icon: ShoppingCart },
  { href: "/finanzas",     label: "Finanzas",     icon: Wallet },
  { href: "/recordatorios",label: "Recordatorios",icon: Bell },
  { href: "/tareas",       label: "Tareas",       icon: ListChecks },
  { href: "/menu",         label: "Menú",         icon: ForkKnife },
  { href: "/documentos",   label: "Documentos",   icon: FileText },
  { href: "/deseos",       label: "Deseos",       icon: Heart },
  { href: "/ajustes",      label: "Ajustes",      icon: GearSix },
  { href: "/actividad",    label: "Actividad",    icon: ClockClockwise },
];

/** Four primary routes shown in the bottom nav bar. Más button is the fifth item. */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Inicio",      icon: House },
  { href: "/compra",       label: "Compra",      icon: ShoppingCart },
  { href: "/finanzas",     label: "Finanzas",    icon: Wallet },
  { href: "/calendario",   label: "Calendario",  icon: CalendarDots },
];

/** Items shown in the Más bottom sheet. */
export const MENU_ITEMS: NavItem[] = [
  { href: "/menu",                   label: "Menú semanal",    icon: ForkKnife },
  { href: "/recordatorios",          label: "Recordatorios",   icon: Bell },
  { href: "/tareas",                 label: "Tareas",          icon: ListChecks },
  { href: "/documentos",             label: "Documentos",      icon: FileText },
  { href: "/deseos",                 label: "Deseos",          icon: Heart },
  { href: "/actividad",              label: "Actividad",       icon: ClockClockwise },
  { href: "/ajustes",                label: "Ajustes",         icon: GearSix },
  { href: "/ajustes/notificaciones", label: "Notificaciones",  icon: BellRinging },
  { href: "/ajustes/dispositivos",   label: "Dispositivos",    icon: DeviceMobile },
  { href: "/papelera",               label: "Papelera",        icon: Trash },
];

/**
 * Manual account labels (organisational only — never connected to a real
 * bank). Legacy values ("ING", "BBVA", "Revolut") remain valid on old rows.
 */
export const ACCOUNT_OPTIONS = [
  { value: "BBVA Andrew", label: "BBVA Andrew" },
  { value: "ING — Cuenta conjunta", label: "ING — Cuenta conjunta" },
  { value: "Revolut", label: "Revolut" },
  { value: "BBVA José", label: "BBVA José" },
];

/** Month options for recurrence-month pickers (1–12, es-ES). */
export const MONTH_OPTIONS = [
  { value: 1, label: "Ene" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" },
  { value: 4, label: "Abr" }, { value: 5, label: "May" }, { value: 6, label: "Jun" },
  { value: 7, label: "Jul" }, { value: 8, label: "Ago" }, { value: 9, label: "Sep" },
  { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dic" },
];

export const MONTH_LABELS: Record<number, string> = Object.fromEntries(
  MONTH_OPTIONS.map((m) => [m.value, m.label]),
);
