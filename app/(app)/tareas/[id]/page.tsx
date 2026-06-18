import { notFound } from "next/navigation";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChoreHistory } from "@/components/chores/ChoreHistory";
import { startOfDay, subWeeks, startOfWeek } from "date-fns";

interface Props {
  params: Promise<{ id: string }>;
}

function computeStreaks(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const unique = [...new Set(dates)].sort(); // ASC

  // Longest streak
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (prev.toISOString().slice(0, 10) === unique[i]) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak (consecutive days ending today or yesterday)
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const desc = [...unique].reverse();
  let current = 0;
  if (desc[0] === todayStr || desc[0] === yesterdayStr) {
    let expected = desc[0];
    for (const d of desc) {
      if (d === expected) {
        current++;
        const prev = new Date(expected);
        prev.setDate(prev.getDate() - 1);
        expected = prev.toISOString().slice(0, 10);
      } else {
        break;
      }
    }
  }

  return { current, longest };
}

export default async function ChoreDetailPage({ params }: Props) {
  const { id } = await params;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: chore } = await supabase
    .from("chores")
    .select("id, title, frequency")
    .eq("id", id)
    .eq("household_id", householdId)
    .single();

  if (!chore) notFound();

  // 12 weeks of history
  const since = startOfWeek(subWeeks(startOfDay(new Date()), 12), { weekStartsOn: 1 });

  const { data: completions } = await supabase
    .from("chore_completions")
    .select("completed_at, completed_by")
    .eq("chore_id", id)
    .gte("completed_at", since.toISOString())
    .order("completed_at", { ascending: false });

  const completionDates = (completions ?? []).map((c) => c.completed_at.slice(0, 10));
  const streaks = computeStreaks([...new Set(completionDates)].sort());
  const completionSet = new Set(completionDates);

  // Build 84-cell grid (Mon-first weeks, 12 columns)
  const grid: { date: string; done: boolean }[] = [];
  for (let i = 0; i < 84; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    grid.push({ date: dateStr, done: completionSet.has(dateStr) });
  }

  return (
    <ChoreHistory
      choreId={chore.id}
      title={chore.title}
      frequency={chore.frequency}
      grid={grid}
      streaks={streaks}
      totalCompletions={(completions ?? []).length}
    />
  );
}
