export interface Geo {
  name: string;
  country?: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  uv: number;
  uvMax: number;
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,uv_index&hourly=uv_index,temperature_2m&daily=uv_index_max&timezone=auto&forecast_days=1`;
  const r = await fetch(url);
  const j = await r.json();

  const hourly: { time: string; uv: number; temp: number }[] = [];
  const times: string[] = j.hourly?.time || [];
  const uvs: number[] = j.hourly?.uv_index || [];
  const temps: number[] = j.hourly?.temperature_2m || [];
  const nowIdx = Math.max(0, times.findIndex((t) => new Date(t).getHours() === new Date().getHours()));
  for (let i = nowIdx; i < Math.min(nowIdx + 12, times.length); i++) {
    hourly.push({ time: times[i], uv: uvs[i] ?? 0, temp: temps[i] ?? 0 });
  }

  let peakUV = 0;
  let peakTime = times[nowIdx] || "";
  for (let i = 0; i < times.length; i++) {
    if ((uvs[i] ?? 0) > peakUV) {
      peakUV = uvs[i];
      peakTime = times[i];
    }
  }

  return {
    uv: j.current?.uv_index ?? 0,
    uvMax: j.daily?.uv_index_max?.[0] ?? 0,
    temp: j.current?.temperature_2m ?? 0,
    feels: j.current?.apparent_temperature ?? 0,
    humidity: j.current?.relative_humidity_2m ?? 0,
    wind: j.current?.wind_speed_10m ?? 0,
    weatherCode: j.current?.weather_code ?? 0,
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
