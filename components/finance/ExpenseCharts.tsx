"use client";

import { useMemo } from "react";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subWeeks,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Expense, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const SLICE_COLORS = ["#0a84ff", "#5ac8fa", "#2dd4bf", "#ffb020", "#8b5cf6", "#059669", "#ff6b6b"];

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
  label?: string;
}

function BarTooltipContent({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "6px 10px",
        boxShadow: "0 2px 8px rgb(0 0 0 / 0.12)",
      }}
    >
      <p style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brown)" }}>
        {formatCurrency(payload[0].value ?? 0)}
      </p>
    </div>
  );
}

function PieTooltipContent({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "6px 10px",
        boxShadow: "0 2px 8px rgb(0 0 0 / 0.12)",
      }}
    >
      <p style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-brown)" }}>
        {formatCurrency(payload[0].value ?? 0)}
      </p>
    </div>
  );
}

interface Props {
  expenses: Expense[];
  categories: Category[];
}

// Compute stable date boundaries once at module load time for chart buckets.
// Charts show relative periods (last 6 months, last 4 weeks) that don't need
// to update within a single page view, so a module-level constant is fine.
function buildMonthBuckets() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const key = format(date, "yyyy-MM");
    const raw = format(date, "MMM", { locale: es });
    return { key, label: raw.charAt(0).toUpperCase() + raw.slice(1) };
  });
}

function buildWeekBuckets() {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const refDate = subWeeks(now, 3 - i);
    return {
      start: startOfWeek(refDate, { weekStartsOn: 1 }),
      end: endOfWeek(refDate, { weekStartsOn: 1 }),
      label: i === 3 ? "Esta sem." : `Sem. -${3 - i}`,
    };
  });
}

function buildMonthRange() {
  const now = new Date();
  return {
    start: format(startOfMonth(now), "yyyy-MM-dd"),
    end: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

const MONTH_BUCKETS = buildMonthBuckets();
const WEEK_BUCKETS = buildWeekBuckets();
const MONTH_RANGE = buildMonthRange();

export function ExpenseCharts({ expenses, categories }: Props) {
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const monthlyData = useMemo(() => {
    return MONTH_BUCKETS.map(({ key, label }) => {
      const total = expenses
        .filter((e) => !e.deleted_at && e.expense_date.startsWith(key))
        .reduce((s, e) => s + Number(e.amount), 0);
      return { label, total };
    });
  }, [expenses]);

  const categoryData = useMemo(() => {
    const thisMonth = expenses.filter(
      (e) =>
        !e.deleted_at &&
        e.expense_date >= MONTH_RANGE.start &&
        e.expense_date <= MONTH_RANGE.end,
    );
    const byCategory: Record<string, number> = {};
    for (const e of thisMonth) {
      const key = e.category_id ?? "__none__";
      byCategory[key] = (byCategory[key] ?? 0) + Number(e.amount);
    }
    return Object.entries(byCategory)
      .map(([id, total]) => ({
        name: id === "__none__" ? "Sin categoría" : (categoryMap[id] ?? "Sin categoría"),
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, categoryMap]);

  const weeklyData = useMemo(() => {
    return WEEK_BUCKETS.map(({ start, end, label }) => {
      const total = expenses
        .filter((e) => {
          if (e.deleted_at) return false;
          const d = parseISO(e.expense_date);
          return d >= start && d <= end;
        })
        .reduce((s, e) => s + Number(e.amount), 0);
      return { label, total };
    });
  }, [expenses]);

  const hasMonthlyData = monthlyData.some((d) => d.total > 0);
  const hasCategoryData = categoryData.length > 0;
  const hasWeeklyData = weeklyData.some((d) => d.total > 0);

  if (!hasMonthlyData && !hasCategoryData) return null;

  return (
    <div className="mb-1 flex flex-col gap-4">
      {/* Monthly spend */}
      {hasMonthlyData && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 text-sm font-semibold text-brown">Gasto mensual</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}€`}
                width={48}
              />
              <Tooltip content={<BarTooltipContent />} cursor={{ fill: "var(--color-sand)", opacity: 0.6 }} />
              <Bar dataKey="total" fill="#0a84ff" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly comparison */}
      {hasWeeklyData && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 text-sm font-semibold text-brown">Comparativa semanal</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}€`}
                width={48}
              />
              <Tooltip content={<BarTooltipContent />} cursor={{ fill: "var(--color-sand)", opacity: 0.6 }} />
              <Bar dataKey="total" fill="#2dd4bf" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category donut */}
      {hasCategoryData && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 text-sm font-semibold text-brown">Por categoría · mes actual</h3>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    isAnimationActive={false}
                  >
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={SLICE_COLORS[idx % SLICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex min-w-0 flex-1 flex-col gap-2">
              {categoryData.slice(0, 5).map((d, idx) => (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: SLICE_COLORS[idx % SLICE_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-brown">{d.name}</span>
                  <span className="shrink-0 text-muted">{formatCurrency(d.total)}</span>
                </li>
              ))}
              {categoryData.length > 5 && (
                <li className="text-xs text-muted">+{categoryData.length - 5} más</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
