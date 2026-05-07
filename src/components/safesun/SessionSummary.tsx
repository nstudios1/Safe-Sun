import { Sparkles, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function SessionSummary() {
  const { t, lastSession, clearLastSession } = useApp();
  if (!lastSession) return null;
  const msg = t("sessionSummary")
    .replace("{vitd}", String(lastSession.vitDGained))
    .replace("{min}", String(lastSession.protectedMin));
  const title = lastSession.completed ? t("sessionComplete") : t("sessionStopped");
  return (
    <div
      className="glass-strong p-5 animate-fade-up relative"
      style={{
        background: "linear-gradient(135deg, hsl(150 70% 45% / 0.3), hsl(170 80% 50% / 0.25))",
        border: "1px solid hsl(150 70% 60% / 0.4)",
      }}
    >
      <button
        onClick={clearLastSession}
        className="absolute top-3 right-3 opacity-70 hover:opacity-100"
        aria-label={t("dismiss")}
      >
        <X size={16} />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-[hsl(45_100%_70%)]" />
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm opacity-90 leading-snug">{msg}</p>
    </div>
  );
}
