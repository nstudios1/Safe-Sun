import { uvColor, uvRiskKey, minutesToBurn } from "@/lib/uv";
import { useApp } from "@/contexts/AppContext";

export function UVGauge({ uv }: { uv: number }) {
  const { t, skinType, weather, spf, beachMode } = useApp();
  const pct = Math.min(uv / 12, 1);
  const angle = Math.round(pct * 270);
  const color = uvColor(uv);
  const risk = t(uvRiskKey(uv));
  // Unprotected time-to-burn (matches the High-UV alert). SPF/Beach shown as context below.
  const baseBurn = minutesToBurn(uv, skinType);
  const burn = beachMode ? Math.max(1, Math.round(baseBurn * 0.8)) : baseBurn;

  return (
    <div className="relative mx-auto" style={{ width: 240, height: 240 }}>
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background: `conic-gradient(from 225deg, ${color} 0deg, ${color} ${angle}deg, hsl(0 0% 100% / 0.08) ${angle}deg, hsl(0 0% 100% / 0.08) 270deg, transparent 270deg)`,
          mask: "radial-gradient(circle, transparent 80px, black 82px)",
          WebkitMask: "radial-gradient(circle, transparent 80px, black 82px)",
        }}
      />
      <div className="absolute inset-6 rounded-full glass flex flex-col items-center justify-center px-4 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{t("uvIndex")}</div>
        <div className="text-6xl font-bold text-shadow-lg leading-none mt-0.5" style={{ color }}>
          {uv.toFixed(1)}
        </div>
        <div className="text-xs font-semibold mt-0.5 opacity-90">{risk}</div>
        <div className="text-[9px] uppercase tracking-wider opacity-70 mt-1.5 leading-tight">
          {t("timeToBurn")} · <span className="font-bold opacity-100">{burn}{t("minutes")}</span>
        </div>
        {weather && (
          <div className="text-[8px] opacity-50 mt-0.5 leading-tight">unprotected · SPF {spf}{beachMode ? " · ☀︎" : ""} · raw {weather.uvRaw.toFixed(1)}</div>
        )}
      </div>
    </div>
  );
}
