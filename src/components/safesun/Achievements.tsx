import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { vitaminDMinutes } from "@/lib/uv";
import { bumpStreak, getStreak, getTimersStarted, getAchievements, readHydration } from "@/lib/progress";
import { Timer, Trophy, Droplet, Sun, MapPin, Flame, ShieldCheck } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  achFirstTimer: <Timer size={20} />,
  achSunPro: <Trophy size={20} />,
  achHydrated: <Droplet size={20} />,
  achVitD: <Sun size={20} />,
  achExplorer: <MapPin size={20} />,
  achStreak7: <Flame size={20} />,
  achSafety: <ShieldCheck size={20} />,
};

export function Achievements() {
  const { weather, skinType, spf, saved, vitDMinutes, safetyMargin, t } = useApp();

  const data = useMemo(() => {
    const streak = bumpStreak() || getStreak();
    const timersStarted = getTimersStarted();
    const hydration = readHydration(weather?.utcOffsetSec ?? 0);
    const vitDGoal = weather ? Math.max(5, vitaminDMinutes(weather.uv, skinType, spf)) : 0;
    return getAchievements({
      streak,
      timersStarted,
      hydration,
      vitD: Math.round(vitDMinutes),
      vitDGoal,
      savedCount: saved.length,
      safetyOn: safetyMargin,
    });
  }, [weather, skinType, spf, saved.length, vitDMinutes, safetyMargin]);

  const streak = getStreak();

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{t("achievements")}</h3>
        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "hsl(28 100% 65%)" }}>
          <Flame size={16} />
          <span className="tabular-nums">{streak}</span>
          <span className="opacity-80 font-normal">{t("dayStreak")}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {data.map((a) => (
          <div
            key={a.key}
            className={`rounded-2xl border p-3 flex flex-col gap-1.5 transition ${
              a.unlocked
                ? "bg-white/10 border-white/25"
                : "bg-white/[0.03] border-white/10 opacity-45 grayscale"
            }`}
          >
            <div className={a.unlocked ? "text-[hsl(45_100%_70%)]" : ""}>{ICONS[a.key]}</div>
            <div className="text-sm font-semibold leading-tight">{t(a.key as any)}</div>
            <div className="text-[11px] opacity-75 leading-snug">{t((a.key + "Desc") as any)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
