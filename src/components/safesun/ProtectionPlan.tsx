import { useApp } from "@/contexts/AppContext";

const PalmShade = () => (
  <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 24v32" />
    <path d="M32 24c-6-8-16-6-20-2 6-2 12 0 16 4" />
    <path d="M32 24c6-8 16-6 20-2-6-2-12 0-16 4" />
    <path d="M32 22c0-8 8-12 14-10-4 0-8 4-10 10" />
    <path d="M22 56h20" />
  </svg>
);
const HatGear = () => (
  <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 40c0-10 7-20 16-20s16 10 16 20" />
    <path d="M8 44c4 4 14 6 24 6s20-2 24-6" />
    <circle cx="26" cy="34" r="2" />
    <circle cx="38" cy="34" r="2" />
  </svg>
);
const Sunscreen = () => (
  <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="22" y="20" width="20" height="32" rx="3" />
    <path d="M26 20v-4h12v4" />
    <path d="M26 30h12" />
    <circle cx="50" cy="20" r="6" />
    <path d="M50 16v-3M50 27v-3M44 20h-3M59 20h-3" />
  </svg>
);

export function ProtectionPlan() {
  const { t } = useApp();
  const items = [
    { Icon: PalmShade, title: t("seekShade"), desc: t("seekShadeDesc"), color: "hsl(160 80% 60%)" },
    { Icon: HatGear, title: t("wearGear"), desc: t("wearGearDesc"), color: "hsl(45 100% 65%)" },
    { Icon: Sunscreen, title: t("reapply"), desc: t("reapplyDesc"), color: "hsl(28 100% 65%)" },
  ];
  return (
    <div className="glass p-5 animate-fade-up">
      <h3 className="text-sm uppercase tracking-widest opacity-80 mb-4">{t("protection")}</h3>
      <div className="space-y-3">
        {items.map(({ Icon, title, desc, color }) => (
          <div key={title} className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-3">
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ color, background: `radial-gradient(circle, ${color}25, transparent 70%)`, boxShadow: `0 0 24px ${color}55` }}
            >
              <Icon />
            </div>
            <div>
              <div className="font-semibold">{title}</div>
              <div className="text-xs opacity-80">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
