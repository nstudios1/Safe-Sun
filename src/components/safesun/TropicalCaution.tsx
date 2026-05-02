import { Palmtree } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function TropicalCaution() {
  const { t, location } = useApp();
  if (!location) return null;
  // Tropics: |lat| <= 23.5
  if (Math.abs(location.lat) > 23.5) return null;
  return (
    <div className="glass p-4 flex items-start gap-2 text-sm animate-fade-up border-l-4 border-[hsl(45_100%_60%)]">
      <Palmtree size={18} className="shrink-0 mt-0.5 text-[hsl(45_100%_70%)]" />
      <p className="leading-snug opacity-95">{t("tropicalCaution")}</p>
    </div>
  );
}
