import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  Bell,
  BellRing,
  ListChecks,
  CalendarDays,
  Wallet,
  FileText,
  Heart,
  Settings,
  Smartphone,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Inicio",       icon: Home },
  { href: "/calendario",   label: "Calendario",   icon: CalendarDays },
  { href: "/compra",       label: "Compra",       icon: ShoppingCart },
  { href: "/finanzas",     label: "Finanzas",     icon: Wallet },
  { href: "/recordatorios",label: "Recordatorios",icon: Bell },
  { href: "/tareas",       label: "Tareas",       icon: ListChecks },
  { href: "/menu",         label: "Menú",         icon: UtensilsCrossed },
  { href: "/documentos",   label: "Documentos",   icon: FileText },
  { href: "/deseos",       label: "Deseos",       icon: Heart },
  { href: "/ajustes",      label: "Ajustes",      icon: Settings },
];

/** Four primary routes shown in the bottom nav bar. Más button is the fifth item. */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Inicio",      icon: Home },
  { href: "/calendario",   label: "Calendario",  icon: CalendarDays },
  { href: "/compra",       label: "Compra",      icon: ShoppingCart },
  { href: "/finanzas",     label: "Finanzas",    icon: Wallet },
];

/** Items shown in the Más bottom sheet. */
export const MENU_ITEMS: NavItem[] = [
  { href: "/menu",                   label: "Menú semanal",    icon: UtensilsCrossed },
  { href: "/recordatorios",          label: "Recordatorios",   icon: Bell },
  { href: "/tareas",                 label: "Tareas",          icon: ListChecks },
  { href: "/documentos",             label: "Documentos",      icon: FileText },
  { href: "/deseos",                 label: "Deseos",          icon: Heart },
  { href: "/ajustes",                label: "Ajustes",         icon: Settings },
  { href: "/ajustes/notificaciones", label: "Notificaciones",  icon: BellRing },
  { href: "/ajustes/dispositivos",   label: "Dispositivos",    icon: Smartphone },
  { href: "/papelera",               label: "Papelera",        icon: Trash2 },
];
