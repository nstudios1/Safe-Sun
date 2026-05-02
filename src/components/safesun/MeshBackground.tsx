import { useApp } from "@/contexts/AppContext";
import { uvBucket } from "@/lib/uv";

export function MeshBackground() {
  const { weather } = useApp();
  const bucket = weather ? uvBucket(weather.uv) : "low";
  const cls = bucket === "low" ? "uv-low" : bucket === "mid" ? "uv-mid" : "uv-high";
  return (
    <div className={`mesh-bg ${cls}`} aria-hidden="true">
      <div className="blob" />
    </div>
  );
}
