import { Info } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function Disclaimer() {
  const { t } = useApp();
  return (
    <footer className="glass p-4 flex items-start gap-2 text-xs opacity-90 animate-fade-up">
      <Info size={14} className="shrink-0 mt-0.5" />
      <p className="leading-snug">{t("disclaimer")}</p>
    </footer>
  );
}
