import {
  Bell,
  CalendarDays,
  ListChecks,
  Wallet,
  Repeat,
  FileText,
  UtensilsCrossed,
  ShoppingCart,
  Home,
  Sun,
  CalendarRange,
  type LucideIcon,
} from "lucide-react";
import type { NotificationCategory } from "@/lib/types";

interface CategoryMeta {
  label: string;
  icon: LucideIcon;
}

export const NOTIFICATION_CATEGORY_META: Record<NotificationCategory, CategoryMeta> = {
  recordatorios: { label: "Recordatorios", icon: Bell },
  calendario: { label: "Calendario", icon: CalendarDays },
  tareas: { label: "Tareas", icon: ListChecks },
  pagos: { label: "Pagos", icon: Wallet },
  suscripciones: { label: "Suscripciones", icon: Repeat },
  documentos: { label: "Documentos", icon: FileText },
  menu: { label: "Menú", icon: UtensilsCrossed },
  compra: { label: "Compra", icon: ShoppingCart },
  actividad_hogar: { label: "Actividad del hogar", icon: Home },
  resumen_diario: { label: "Resumen diario", icon: Sun },
  resumen_semanal: { label: "Resumen semanal", icon: CalendarRange },
};
