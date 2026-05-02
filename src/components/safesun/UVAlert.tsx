import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { minutesToBurn } from "@/lib/uv";

export function UVAlert() {
  const { weather, skinType, t } = useApp();
  if (!weather || weather.uv < 7) return null;
  const min = minutesToBurn(weather.uv, skinType);
  const extreme = weather.uv >= 8;
  const title = extreme ? t("extremeTitle") : t("highWarnTitle");
  const desc = (extreme ? t("extremeDesc") : t("highWarnDesc")).replace("{min}", String(min));
  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-3xl p-5 border-2 animate-fade-up ${
        extreme
          ? "bg-[hsl(0_85%_25%/0.85)] border-[hsl(0_95%_55%)] shadow-[0_0_40px_hsl(0_95%_55%/0.6)] animate-pulse-glow"
          : "bg-[hsl(0_75%_30%/0.7)] border-[hsl(0_85%_55%)] shadow-[0_0_28px_hsl(0_85%_55%/0.45)]"
      }`}
      style={{ color: "hsl(0 0% 100%)" }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {extreme ? <ShieldAlert size={28} /> : <AlertTriangle size={26} />}
        </div>
        <div>
          <div className="font-extrabold tracking-wide text-lg leading-tight text-shadow-lg">{title}</div>
          <div className="text-sm mt-1 opacity-95">{desc}</div>
        </div>
      </div>
    </div>
  );
}
