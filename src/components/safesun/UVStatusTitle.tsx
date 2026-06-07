import { useApp } from "@/contexts/AppContext";
import type { DictKey } from "@/lib/i18n";

export function UVStatusTitle() {
  const { weather, t } = useApp();
  if (!weather) return null;
  const uv = weather.uv;
  let titleKey: DictKey = "riskTitleMinimal";
  let subKey: DictKey = "riskSubMinimal";
  let color = "hsl(150 70% 65%)";
  let glow = "hsl(150 80% 50% / 0.6)";
  if (uv >= 11) {
    titleKey = "riskTitleExtreme"; subKey = "riskSubExtreme";
    color = "hsl(300 90% 75%)"; glow = "hsl(320 95% 55% / 0.85)";
  } else if (uv >= 8) {
    titleKey = "riskTitleVeryHigh"; subKey = "riskSubVeryHigh";
    color = "hsl(0 95% 70%)"; glow = "hsl(0 90% 55% / 0.75)";
  } else if (uv >= 6) {
    titleKey = "riskTitleHigh"; subKey = "riskSubHigh";
    color = "hsl(15 100% 68%)"; glow = "hsl(15 100% 55% / 0.7)";
  } else if (uv >= 3) {
    titleKey = "riskTitleModerate"; subKey = "riskSubModerate";
    color = "hsl(40 100% 65%)"; glow = "hsl(40 100% 50% / 0.6)";
  }
  return (
    <div
      className="glass-strong px-5 py-4 text-center animate-fade-up"
      style={{ boxShadow: `0 0 30px ${glow}, inset 0 0 0 1px ${color.replace(")", " / 0.35)")}` }}
    >
      <div
        className="text-2xl sm:text-3xl font-extrabold tracking-[0.18em] uppercase"
        style={{ color, textShadow: `0 0 14px ${glow}, 0 0 30px ${glow}` }}
      >
        {t(titleKey)}
      </div>
      <div className="text-xs sm:text-sm mt-1.5 opacity-90 leading-snug">
        {t(subKey)}
      </div>
    </div>
  );
}