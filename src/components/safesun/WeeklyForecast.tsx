import { useApp } from "@/contexts/AppContext";
import { uvColor } from "@/lib/uv";
import { weatherLabel, weatherEmoji } from "@/lib/weather";

export function WeeklyForecast() {
  const { weather, t, lang } = useApp();
  if (!weather?.daily?.length) return null;

  const fmt = new Intl.DateTimeFormat(lang === "es" ? "es" : "en", { weekday: "short" });

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="text-xs uppercase tracking-widest opacity-80 mb-3">{t("weeklyTitle")}</div>
      <div className="space-y-1.5">
        {weather.daily.map((d, i) => {
          const day = new Date(d.date + "T12:00:00");
          const hiF = Math.round((d.tempMax * 9) / 5 + 32);
          const loF = Math.round((d.tempMin * 9) / 5 + 32);
          return (
            <div key={d.date} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="w-12 text-xs font-semibold opacity-90 shrink-0">
                {i === 0 ? t("today") : fmt.format(day)}
              </div>
              <div className="text-lg shrink-0" title={weatherLabel(d.code)}>{weatherEmoji(d.code)}</div>
              <div
                className="text-sm font-bold w-10 text-right shrink-0 tabular-nums"
                style={{ color: uvColor(d.uvMax) }}
              >
                {d.uvMax.toFixed(1)}
              </div>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (d.uvMax / 12) * 100)}%`, background: uvColor(d.uvMax) }}
                />
              </div>
              <div className="text-xs opacity-80 tabular-nums shrink-0 w-16 text-right">
                {hiF}° <span className="opacity-60">{loF}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
