import { useContext } from "react";
import { Ctx } from "@/contexts/AppContext";
import { uvBucket } from "@/lib/uv";

export function MeshBackground() {
  const ctx = useContext(Ctx);
  const weather = ctx?.weather ?? null;
  const bucket = weather ? uvBucket(weather.uv) : "low";
  const cls =
    bucket === "low" ? "uv-low" :
    bucket === "mid" ? "uv-mid" :
    bucket === "extreme" ? "uv-extreme" : "uv-high";
  return (
    <div className={`mesh-bg ${cls}`} aria-hidden="true">
      <div className="blob" />
    </div>
  );
}
