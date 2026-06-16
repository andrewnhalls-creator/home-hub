import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  Bell,
  ListChecks,
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
  { href: "/compra", label: "Compra", icon: ShoppingCart },
  { href: "/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/deseos", label: "Deseos", icon: Heart },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export const PRIMARY_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ["/dashboard", "/compra", "/menu", "/finanzas"].includes(item.href),
);

export const MORE_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter(
  (item) => !PRIMARY_NAV_ITEMS.includes(item),
);
