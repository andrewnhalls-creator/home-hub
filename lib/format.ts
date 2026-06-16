import { format } from "date-fns";
import { es } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, "dd/MM/yyyy", { locale: es });
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, "HH:mm", { locale: es });
}
