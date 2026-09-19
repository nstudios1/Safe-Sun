// Streaks, stats and achievements — all persisted locally, no account needed.

const STREAK_KEY = "ss_streak";
const STATS_KEY = "ss_stats";

interface Streak { last: string; count: number; }
interface Stats { timersStarted: number; }

function load<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

function todayKey(): string {
  return new Date().toDateString();
}
function yesterdayKey(): string {
  return new Date(Date.now() - 86400000).toDateString();
}

/** Call once per app open. Returns the current streak. */
export function bumpStreak(): number {
  const s = load<Streak>(STREAK_KEY, { last: "", count: 0 });
  const today = todayKey();
  if (s.last === today) return Math.max(1, s.count);
  const count = s.last === yesterdayKey() ? s.count + 1 : 1;
  save(STREAK_KEY, { last: today, count } as Streak);
  return count;
}

export function getStreak(): number {
  const s = load<Streak>(STREAK_KEY, { last: "", count: 0 });
  const today = todayKey();
  // Streak only counts if it's active today or yesterday
  if (s.last !== today && s.last !== yesterdayKey()) return 0;
  return Math.max(1, s.count);
}

export function incrementTimersStarted() {
  const s = load<Stats>(STATS_KEY, { timersStarted: 0 });
  s.timersStarted = (s.timersStarted | 0) + 1;
  save(STATS_KEY, s);
}

export function getTimersStarted(): number {
  return load<Stats>(STATS_KEY, { timersStarted: 0 }).timersStarted | 0;
}

export interface Achievement {
  key: string;
  unlocked: boolean;
}

export interface ProgressInput {
  streak: number;
  timersStarted: number;
  hydration: number;
  vitD: number;
  vitDGoal: number;
  savedCount: number;
  safetyOn: boolean;
}

export function getAchievements(p: ProgressInput): Achievement[] {
  return [
    { key: "achFirstTimer", unlocked: p.timersStarted >= 1 },
    { key: "achSunPro", unlocked: p.timersStarted >= 10 },
    { key: "achHydrated", unlocked: p.hydration >= 8 },
    { key: "achVitD", unlocked: p.vitDGoal > 0 && p.vitD >= p.vitDGoal },
    { key: "achExplorer", unlocked: p.savedCount >= 3 },
    { key: "achStreak7", unlocked: p.streak >= 7 },
    { key: "achSafety", unlocked: p.safetyOn },
  ];
}

// Hydration card storage (shared read — the card owns writes)
export function readHydration(offsetSec: number): number {
  try {
    const v = localStorage.getItem("ss_hydration_v1");
    if (!v) return 0;
    const s = JSON.parse(v) as { date: string; count: number };
    const today = new Date(Date.now() + offsetSec * 1000).toISOString().slice(0, 10);
    return s.date === today ? Math.max(0, s.count | 0) : 0;
  } catch { return 0; }
}
