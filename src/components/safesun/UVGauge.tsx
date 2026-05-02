import { uvColor, uvRiskKey } from "@/lib/uv";
import { useApp } from "@/contexts/AppContext";

export function UVGauge({ uv }: { uv: number }) {
  const { t } = useApp();
  const pct = Math.min(uv / 12, 1);
  const angle = Math.round(pct * 270);
  const color = uvColor(uv);
  const risk = t(uvRiskKey(uv));

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
      <div className="absolute inset-6 rounded-full glass flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-[0.2em] opacity-80">{t("uvIndex")}</div>
        <div className="text-7xl font-bold text-shadow-lg leading-none mt-1" style={{ color }}>
          {uv.toFixed(1)}
        </div>
        <div className="text-sm font-semibold mt-1 opacity-90">{risk}</div>
      </div>
    </div>
  );
}
