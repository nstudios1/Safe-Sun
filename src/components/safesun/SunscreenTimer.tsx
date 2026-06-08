import { Clock, RotateCcw, Play } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function SunscreenTimer() {
  const { t, timerEndsAt, timerRemaining, startTimer, resetTimer, weather } = useApp();
  const total = 2 * 60 * 60 * 1000;
  const pct = timerEndsAt ? 1 - timerRemaining / total : 0;
  const night = !!weather?.isNight;

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} />
        <h3 className="font-semibold">{t("sunscreenTimer")}</h3>
      </div>
      <div className="relative h-2 rounded-full bg-white/10 overflow-hidden mb-4">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(28_100%_60%)] to-[hsl(0_85%_55%)]" style={{ width: `${pct * 100}%` }} />
      </div>
      {night ? (
        <div className="text-center py-3">
          <div className="text-xs uppercase tracking-widest opacity-80">{t("nightTimeLabel")}</div>
          <div className="text-2xl font-bold tabular-nums mt-1 text-shadow-lg">{t("nightTime")}</div>
        </div>
      ) : timerEndsAt ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">{t("timerActive")}</div>
            <div className="text-2xl font-bold tabular-nums text-shadow-lg">{fmt(timerRemaining)}</div>
          </div>
          <button onClick={resetTimer} className="glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/20 transition">
            <RotateCcw size={14} />{t("resetTimer")}
          </button>
        </div>
      ) : (
        <button
          onClick={startTimer}
          className="w-full glass-strong py-6 px-4 rounded-3xl flex items-center justify-center gap-3 hover:bg-white/25 active:scale-[0.98] transition group"
        >
          <Play size={22} className="opacity-90 group-hover:scale-110 transition" />
          <span className="text-base sm:text-lg font-light tracking-wide leading-snug text-center text-shadow">
            {t("startTimer")}
          </span>
        </button>
      )}
    </div>
  );
}
