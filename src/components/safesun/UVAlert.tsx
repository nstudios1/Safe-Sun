import { AlertTriangle, ShieldAlert, Flame } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { minutesToBurn } from "@/lib/uv";

export function UVAlert() {
  const { weather, skinType, t } = useApp();
  if (!weather) return null;
  const peak = weather.peakUV || weather.uv;
  const min = minutesToBurn(peak, skinType);
  const flashing = min < 20;
  const extreme = peak >= 8;
  const showAlert = peak >= 7 || flashing;
  if (!showAlert) return null;

  if (flashing) {
    return (
      <div role="alert" className="relative overflow-hidden rounded-3xl p-5 border-2 border-[hsl(0_100%_70%)] animate-flash-red text-white animate-fade-up">
        <div className="flex items-start gap-3">
          <Flame size={30} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold tracking-wide text-lg leading-tight text-shadow-lg">{t("flashAlertTitle")}</div>
            <div className="text-sm mt-1 opacity-95">{t("flashAlertDesc").replace("{min}", String(min))}</div>
          </div>
        </div>
      </div>
    );
  }

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
