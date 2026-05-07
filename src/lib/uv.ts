export type UVLevel = "low" | "mid" | "high" | "extreme";

export function uvBucket(uv: number): UVLevel {
  if (uv <= 2) return "low";
  if (uv <= 7) return "mid";
  return "extreme";
}

export function uvRiskKey(uv: number): "riskLow" | "riskMod" | "riskHigh" | "riskVeryHigh" | "riskExtreme" {
  if (uv < 3) return "riskLow";
  if (uv < 6) return "riskMod";
  if (uv < 8) return "riskHigh";
  if (uv < 11) return "riskVeryHigh";
  return "riskExtreme";
}

export function uvColor(uv: number): string {
  if (uv < 3) return "hsl(150 70% 50%)";
  if (uv < 6) return "hsl(45 100% 55%)";
  if (uv < 8) return "hsl(25 100% 55%)";
  if (uv < 11) return "hsl(0 85% 55%)";
  return "hsl(285 80% 55%)";
}

// Minutes to burn (rough) by Fitzpatrick skin type and UV index
const SKIN_MED: Record<number, number> = { 1: 200, 2: 250, 3: 300, 4: 400, 5: 600, 6: 1000 };
export function minutesToBurn(uv: number, skinType: number, spf: number = 1, reflection: boolean = false): number {
  if (uv <= 0) return 999;
  const med = SKIN_MED[skinType] ?? 300;
  const base = med / (3 * uv);
  const spfMul = Math.max(1, spf);
  const reflMul = reflection ? 0.8 : 1; // -20% under reflective surfaces
  return Math.max(1, Math.round(base * spfMul * reflMul));
}

// Minutes of exposure to reach daily vitamin D goal
export function vitaminDMinutes(uv: number, skinType: number, spf: number = 1): number {
  if (uv <= 0) return 0;
  const factor = [0, 1, 1.1, 1.3, 1.6, 2, 2.5][skinType] || 1.3;
  // Higher SPF blocks UVB → more time needed for synthesis (capped multiplier)
  const spfMul = 1 + Math.log2(Math.max(1, spf)) * 0.4;
  return Math.round((25 / uv) * factor * spfMul);
}
