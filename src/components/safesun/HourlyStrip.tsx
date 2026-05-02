import { useApp } from "@/contexts/AppContext";
import { uvColor } from "@/lib/uv";

export function HourlyStrip() {
  const { weather, t } = useApp();
  if (!weather) return null;
  return (
    <div className="glass p-5 animate-fade-up">
      <h3 className="text-sm uppercase tracking-widest opacity-80 mb-3">{t("nextHours")}</h3>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {weather.hourly.map((h, i) => {
          const d = new Date(h.time);
          const label = d.getHours().toString().padStart(2, "0") + ":00";
          const height = Math.max(8, Math.min(60, h.uv * 5));
          return (
            <div key={i} className="shrink-0 w-12 flex flex-col items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-2">
              <div className="text-[10px] opacity-80">{label}</div>
              <div className="h-[60px] flex items-end">
                <div className="w-3 rounded-full" style={{ height, background: uvColor(h.uv) }} />
              </div>
              <div className="text-xs font-semibold">{h.uv.toFixed(0)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
