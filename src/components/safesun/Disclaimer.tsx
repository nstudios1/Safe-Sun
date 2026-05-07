import { Info } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function Disclaimer() {
  const { t } = useApp();
  return (
    <footer className="animate-fade-up space-y-2 pt-2">
      <p className="text-center text-xs opacity-90 tracking-wide">{t("designedBy")}</p>
      <div className="glass p-4 flex items-start gap-2 text-[11px] opacity-90">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p className="leading-snug">{t("shortDisclaimer")}</p>
      </div>
    </footer>
  );
}
