import { Sun } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const SPF_OPTIONS = [15, 30, 50, 100];

export function SpfSelector() {
  const { t, spf, setSpf } = useApp();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs opacity-80">
        <Sun size={14} />
        <span>{t("spfDesc")}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SPF_OPTIONS.map((v) => (
          <button
            key={v}
            onClick={() => setSpf(v)}
            className={`py-3 rounded-2xl text-sm font-bold transition ${
              spf === v
                ? "bg-gradient-to-br from-[hsl(150_70%_45%)] to-[hsl(170_80%_50%)] text-white shadow-lg scale-[1.03]"
                : "bg-white/5 hover:bg-white/10 border border-white/10"
            }`}
          >
            SPF {v}
          </button>
        ))}
      </div>
    </div>
  );
}
