import { Waves } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function ReflectionToggle() {
  const { t, reflection, setReflection } = useApp();
  return (
    <div className="flex items-start gap-3">
      <div
        className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{
          background: reflection
            ? "linear-gradient(135deg, hsl(195 85% 55%), hsl(170 80% 50%))"
            : "hsl(0 0% 100% / 0.1)",
        }}
      >
        <Waves size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{t("reflection")}</h4>
        <p className="text-[11px] opacity-70 mt-0.5 leading-snug">{t("reflectionDesc")}</p>
      </div>
      <button
        onClick={() => setReflection(!reflection)}
        aria-pressed={reflection}
        className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
          reflection ? "bg-[hsl(195_85%_55%)]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
            reflection ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
