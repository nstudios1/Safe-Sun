import { useApp } from "@/contexts/AppContext";

const TONE: Record<number, string> = {
  1: "#f7d9c4", 2: "#e8b894", 3: "#c99979",
  4: "#a3714f", 5: "#6f4a2d", 6: "#3d2415",
};

export function UserAvatar({ size = 40 }: { size?: number }) {
  const { profile, skinType } = useApp();
  const color = TONE[skinType] ?? TONE[3];
  const initial = (profile?.name?.[0] || "S").toUpperCase();
  return (
    <div
      className="rounded-full border-2 border-white/40 flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size, height: size, background: color,
        fontSize: size * 0.42,
        boxShadow: `0 6px 20px ${color}80, inset 0 1px 0 hsl(0 0% 100% / 0.3)`,
      }}
    >
      {initial}
    </div>
  );
}
