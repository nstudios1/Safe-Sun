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
  windGust: number;
  precipProb: number;
  cloudCover: number;
  weatherCode: number;
  hourly: { time: string; uv: number; temp: number; humidity: number; windGust: number; precipProb: number }[];
  peakUV: number;
  peakTime: string;
  sunrise: string;
  sunset: string;
  timezone: string;
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

export async function fetchWeather(lat: number, lon: number, safetyMargin: boolean = true): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_gusts_10m,precipitation_probability,weather_code,cloud_cover,uv_index,uv_index_clear_sky&hourly=uv_index,uv_index_clear_sky,temperature_2m,relative_humidity_2m,wind_gusts_10m,precipitation_probability&daily=uv_index_max,uv_index_clear_sky_max,sunrise,sunset&timezone=auto&forecast_days=1`;
  const r = await fetch(url);
  const j = await r.json();

  const hourly: WeatherData["hourly"] = [];
  const times: string[] = j.hourly?.time || [];
  const uvs: number[] = j.hourly?.uv_index || [];
  const uvsClear: number[] = j.hourly?.uv_index_clear_sky || [];
  const temps: number[] = j.hourly?.temperature_2m || [];
  const hums: number[] = j.hourly?.relative_humidity_2m || [];
  const gusts: number[] = j.hourly?.wind_gusts_10m || [];
  const precs: number[] = j.hourly?.precipitation_probability || [];
  // Determine the current hour in the LOCATION's timezone (not the browser's).
  const offsetSec: number = j.utc_offset_seconds ?? 0;
  const localNow = new Date(Date.now() + offsetSec * 1000);
  const localHour = localNow.getUTCHours();
  const localDate = localNow.toISOString().slice(0, 10); // YYYY-MM-DD in location tz
  let nowIdx = times.findIndex((t) => t.startsWith(localDate) && new Date(t + "Z").getUTCHours() === localHour);
  if (nowIdx < 0) nowIdx = times.findIndex((t) => new Date(t + "Z").getUTCHours() === localHour);
  if (nowIdx < 0) nowIdx = 0;
  for (let i = nowIdx; i < Math.min(nowIdx + 12, times.length); i++) {
    const safe = Math.max(uvs[i] ?? 0, uvsClear[i] ?? 0);
    hourly.push({
      time: times[i],
      uv: safe,
      temp: temps[i] ?? 0,
      humidity: hums[i] ?? 0,
      windGust: gusts[i] ?? 0,
      precipProb: precs[i] ?? 0,
    });
  }

  let peakUV = 0;
  let peakTime = times[nowIdx] || "";
  for (let i = 0; i < times.length; i++) {
    const v = Math.max(uvs[i] ?? 0, uvsClear[i] ?? 0);
    if (v > peakUV) {
      peakUV = v;
      peakTime = times[i];
    }
  }

  const code: number = j.current?.weather_code ?? 0;
  const cloud: number = j.current?.cloud_cover ?? 0;
  const currentRaw = j.current?.uv_index ?? 0;
  const currentClear = j.current?.uv_index_clear_sky ?? 0;
  const hourCurrent = uvs[nowIdx] ?? 0;
  const hourClear = uvsClear[nowIdx] ?? 0;
  // Maximum hourly forecast (use clear-sky max when sky is clear or low cloud)
  let baseUV = Math.max(currentRaw, hourCurrent);
  const isClear = code === 0 || cloud < 25;
  if (isClear) baseUV = Math.max(baseUV, currentClear, hourClear);
  // Safety margin: +1.5 to avoid under-protection (toggleable)
  const safeUV = Math.max(0, baseUV + (safetyMargin ? 1.5 : 0));

  return {
    uv: Math.round(safeUV * 10) / 10,
    uvRaw: currentRaw,
    uvClearSky: Math.max(currentClear, j.daily?.uv_index_clear_sky_max?.[0] ?? 0),
    uvMax: Math.max(j.daily?.uv_index_max?.[0] ?? 0, j.daily?.uv_index_clear_sky_max?.[0] ?? 0),
    temp: j.current?.temperature_2m ?? 0,
    feels: j.current?.apparent_temperature ?? 0,
    humidity: j.current?.relative_humidity_2m ?? 0,
    wind: j.current?.wind_speed_10m ?? 0,
    windGust: j.current?.wind_gusts_10m ?? 0,
    precipProb: j.current?.precipitation_probability ?? 0,
    cloudCover: cloud,
    weatherCode: code,
    hourly,
    peakUV,
    peakTime,
    sunrise: j.daily?.sunrise?.[0] ?? "",
    sunset: j.daily?.sunset?.[0] ?? "",
    timezone: j.timezone ?? "",
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
