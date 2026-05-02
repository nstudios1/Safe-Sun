export interface Geo {
  name: string;
  country?: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  uv: number;
  uvMax: number;
  uvRaw: number;
  uvClearSky: number;
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  cloudCover: number;
  weatherCode: number;
  hourly: { time: string; uv: number; temp: number }[];
  peakUV: number;
  peakTime: string;
}

export async function geocodeCity(query: string, lang: string = "en"): Promise<Geo[]> {
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=${lang}&format=json`
  );
  const j = await r.json();
  return (j.results || []).map((x: any) => ({
    name: x.name,
    country: x.country,
    lat: x.latitude,
    lon: x.longitude,
  }));
}

export async function reverseGeocode(lat: number, lon: number, lang = "en"): Promise<Geo> {
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=${lang}&format=json`
    );
    const j = await r.json();
    const x = j.results?.[0];
    if (x) return { name: x.name, country: x.country, lat, lon };
  } catch {}
  return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  // Weather (current + hourly temp) from Open-Meteo forecast
  const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,cloud_cover&hourly=temperature_2m&timezone=auto&forecast_days=1`;
  // UV from CAMS (Copernicus Atmosphere Monitoring Service) via Open-Meteo Air Quality API
  const camsUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=uv_index,uv_index_clear_sky&domains=cams_global&timezone=auto&forecast_days=1`;
  const [wxR, camsR] = await Promise.all([fetch(wxUrl), fetch(camsUrl)]);
  const j = await wxR.json();
  const cams = await camsR.json();

  const hourly: { time: string; uv: number; temp: number }[] = [];
  const times: string[] = j.hourly?.time || [];
  const camsTimes: string[] = cams.hourly?.time || [];
  const uvs: number[] = cams.hourly?.uv_index || [];
  const uvsClear: number[] = cams.hourly?.uv_index_clear_sky || [];
  const temps: number[] = j.hourly?.temperature_2m || [];
  const nowH = new Date().getHours();
  const nowIdx = Math.max(0, times.findIndex((t) => new Date(t).getHours() === nowH));
  const camsNowIdx = Math.max(0, camsTimes.findIndex((t) => new Date(t).getHours() === nowH));
  for (let i = nowIdx; i < Math.min(nowIdx + 12, times.length); i++) {
    const ci = camsNowIdx + (i - nowIdx);
    const safe = Math.max(uvs[ci] ?? 0, uvsClear[ci] ?? 0);
    hourly.push({ time: times[i], uv: safe, temp: temps[i] ?? 0 });
  }

  // Daily peak from CAMS (use clear-sky as worst-case ceiling)
  let peakUV = 0;
  let peakTime = camsTimes[camsNowIdx] || "";
  for (let i = 0; i < camsTimes.length; i++) {
    const v = Math.max(uvs[i] ?? 0, uvsClear[i] ?? 0);
    if (v > peakUV) { peakUV = v; peakTime = camsTimes[i]; }
  }

  const code: number = j.current?.weather_code ?? 0;
  const cloud: number = j.current?.cloud_cover ?? 0;
  const currentRaw = uvs[camsNowIdx] ?? 0;
  // PRIMARY = Daily Maximum UV (worst case for the day, ignoring cloud cover)
  // Plus a +1.0 safety buffer against sensor inaccuracy
  const safeUV = Math.max(0, peakUV + 1.0);

  return {
    uv: Math.round(safeUV * 10) / 10,
    uvRaw: currentRaw,
    uvClearSky: peakUV,
    uvMax: peakUV,
    temp: j.current?.temperature_2m ?? 0,
    feels: j.current?.apparent_temperature ?? 0,
    humidity: j.current?.relative_humidity_2m ?? 0,
    wind: j.current?.wind_speed_10m ?? 0,
    cloudCover: cloud,
    weatherCode: code,
    hourly,
    peakUV,
    peakTime,
  };
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  return "Storm";
}
