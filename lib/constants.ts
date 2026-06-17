import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  Bell,
  ListChecks,
  CalendarDays,
  Wallet,
  FileText,
  Heart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/compra", label: "Compra", icon: ShoppingCart },
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/deseos", label: "Deseos", icon: Heart },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export const PRIMARY_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ["/dashboard", "/calendario", "/compra", "/finanzas"].includes(item.href),
);

export const MORE_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter(
  (item) => !PRIMARY_NAV_ITEMS.includes(item),
);
