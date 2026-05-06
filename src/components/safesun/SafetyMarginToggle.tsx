import { ShieldCheck } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function SafetyMarginToggle() {
  const { t, safetyMargin, setSafetyMargin } = useApp();
  return (
    <div className="glass p-4 animate-fade-up">
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: safetyMargin
              ? "linear-gradient(135deg, hsl(150 70% 45%), hsl(170 80% 50%))"
              : "hsl(0 0% 100% / 0.1)",
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">{t("safetyMargin")}</h3>
            {safetyMargin && (
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[hsl(150_70%_45%/0.25)] text-[hsl(150_80%_75%)] font-bold">
                {t("recommended")}
              </span>
            )}
          </div>
          <p className="text-xs opacity-80 mt-0.5 leading-snug">
            {safetyMargin ? t("safetyMarginOn") : t("safetyMarginOff")}
          </p>
          <p className="text-[11px] opacity-60 mt-1 leading-snug">{t("safetyMarginDesc")}</p>
        </div>
        <button
          onClick={() => setSafetyMargin(!safetyMargin)}
          aria-pressed={safetyMargin}
          aria-label={t("safetyMargin")}
          className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
            safetyMargin ? "bg-[hsl(150_70%_45%)]" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
              safetyMargin ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
