import { Request, Response } from 'express';
import { env } from '../config/env';

const BASE = 'https://api.openweathermap.org/data/2.5';
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';

function parseQueryLatLon(req: Request): { lat: number; lon: number; fromQuery: boolean } {
  const qLat = req.query.lat;
  const qLon = req.query.lon;
  if (qLat === undefined || qLon === null || qLon === undefined || qLat === null) {
    return { lat: env.WEATHER_LAT, lon: env.WEATHER_LON, fromQuery: false };
  }
  const lat = Number(qLat);
  const lon = Number(qLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { lat: env.WEATHER_LAT, lon: env.WEATHER_LON, fromQuery: false };
  }
  return { lat, lon, fromQuery: true };
}

function parseTimeZone(req: Request): string {
  const tz = req.query.tz;
  if (typeof tz === 'string' && tz.trim().length > 0) return tz.trim();
  return 'America/Sao_Paulo';
}

function parseYmd(q: unknown): string | undefined {
  if (typeof q !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(q)) return undefined;
  return q;
}

/** Precipitação diária (mm) no ponto GPS via Open-Meteo (sem API key). */
async function fetchOpenMeteoDailyRain(
  lat: number,
  lon: number,
  timeZone: string,
  todayKey: string,
  yesterdayKey: string
): Promise<{ todayMm: number; yesterdayMm: number | null }> {
  const url = new URL(OPEN_METEO);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'precipitation_sum');
  url.searchParams.set('timezone', timeZone);
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('past_days', '1');

  const res = await fetch(url.toString());
  if (!res.ok) return { todayMm: 0, yesterdayMm: null };
  const json = (await res.json()) as {
    daily?: { time?: string[]; precipitation_sum?: (number | null)[] };
  };
  const times = json.daily?.time ?? [];
  const sums = json.daily?.precipitation_sum ?? [];

  let todayMm = 0;
  let yesterdayMm: number | null = null;
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const v = sums[i];
    if (t === todayKey) todayMm = typeof v === 'number' && !Number.isNaN(v) ? v : 0;
    if (t === yesterdayKey) yesterdayMm = typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  }
  return {
    todayMm: Math.round(todayMm * 10) / 10,
    yesterdayMm: yesterdayMm === null ? null : Math.round(yesterdayMm * 10) / 10,
  };
}

function defaultTodayYesterdayKeys(timeZone: string): { todayKey: string; yesterdayKey: string } {
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const yesterdayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(Date.now() - 24 * 60 * 60 * 1000));
  return { todayKey, yesterdayKey };
}

export class WeatherController {
  async current(req: Request, res: Response): Promise<Response> {
    try {
      const { lat, lon, fromQuery } = parseQueryLatLon(req);
      const timeZone = parseTimeZone(req);
      const todayQ = parseYmd(req.query.today);
      const yesterdayQ = parseYmd(req.query.yesterday);
      const { todayKey, yesterdayKey } =
        todayQ && yesterdayQ
          ? { todayKey: todayQ, yesterdayKey: yesterdayQ }
          : defaultTodayYesterdayKeys(timeZone);

      let rainTodayMm = 0;
      let rainYesterdayMm: number | null = null;
      try {
        const om = await fetchOpenMeteoDailyRain(lat, lon, timeZone, todayKey, yesterdayKey);
        rainTodayMm = om.todayMm;
        rainYesterdayMm = om.yesterdayMm;
      } catch (e) {
        console.error('Open-Meteo rain:', e);
      }

      if (!env.WEATHER_API_KEY?.trim()) {
        return res.status(200).json({
          temp: 25,
          description: 'Clima não configurado',
          tempMax: 31,
          tempMin: 24,
          hours: [
            { time: Math.floor(Date.now() / 1000), temp: 25, pop: 10 },
            { time: Math.floor(Date.now() / 1000) + 3600, temp: 25, pop: 18 },
            { time: Math.floor(Date.now() / 1000) + 7200, temp: 25, pop: 25 },
            { time: Math.floor(Date.now() / 1000) + 10800, temp: 25, pop: 28 },
          ],
          humidity: 60,
          pressure: 1013,
          feelsLike: 25,
          windSpeedKmH: 10,
          windDirection: 'SE',
          visibilityKm: 10,
          uvIndex: 2,
          rainTodayMm,
          rainYesterdayMm,
          rainFromGps: fromQuery,
        });
      }

      const latStr = String(lat);
      const lonStr = String(lon);
      const appid = env.WEATHER_API_KEY.trim();
      const params = { lat: latStr, lon: lonStr, appid, units: 'metric', lang: 'pt_br' };

      const currentUrl = `${BASE}/weather?${new URLSearchParams(params)}`;
      const currentResp = await fetch(currentUrl);
      if (!currentResp.ok) {
        const errBody = await currentResp.text();
        console.error('OpenWeather current:', currentResp.status, errBody);
        return res.status(502).json({ message: 'Falha ao consultar clima. Verifique WEATHER_API_KEY e coordenadas.' });
      }
      const currentJson = (await currentResp.json()) as {
        main?: {
          temp?: number;
          temp_min?: number;
          temp_max?: number;
          humidity?: number;
          pressure?: number;
          feels_like?: number;
        };
        weather?: Array<{ description?: string }>;
        wind?: { speed?: number; deg?: number };
        visibility?: number;
      };
      const main = currentJson.main ?? {};
      const temp = main.temp ?? 25;
      const tempMin = main.temp_min ?? temp - 2;
      const tempMax = main.temp_max ?? temp + 2;
      const description = currentJson.weather?.[0]?.description ?? 'N/A';
      const humidity = main.humidity ?? 0;
      const pressure = main.pressure ?? 0;
      const feelsLike = main.feels_like ?? temp;

      const windSpeed = (currentJson.wind?.speed ?? 0) * 3.6;
      const windDeg = currentJson.wind?.deg ?? 0;
      const windDir = (() => {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const idx = Math.round(windDeg / 45) % 8;
        return dirs[idx];
      })();

      const visibilityKm = (currentJson.visibility ?? 0) / 1000;

      const forecastUrl = `${BASE}/forecast?${new URLSearchParams(params)}`;
      const forecastResp = await fetch(forecastUrl);
      let hours: Array<{ time: number; temp: number; pop: number }> = [];
      if (forecastResp.ok) {
        const forecastJson = (await forecastResp.json()) as {
          list?: Array<{ dt: number; main?: { temp?: number }; pop?: number }>;
        };
        const list = (forecastJson.list ?? []).slice(0, 4);
        hours = list.map((h) => ({
          time: h.dt,
          temp: h.main?.temp ?? temp,
          pop: Math.round((h.pop ?? 0) * 100),
        }));
      }
      if (hours.length === 0) {
        const now = Math.floor(Date.now() / 1000);
        hours = [0, 1, 2, 3].map((i) => ({ time: now + i * 3600, temp, pop: 0 }));
      }

      return res.status(200).json({
        temp,
        description,
        tempMax,
        tempMin,
        hours,
        humidity,
        pressure,
        feelsLike,
        windSpeedKmH: windSpeed,
        windDirection: windDir,
        visibilityKm,
        uvIndex: 2,
        rainTodayMm,
        rainYesterdayMm,
        rainFromGps: fromQuery,
      });
    } catch (e) {
      console.error('Weather error:', e);
      return res.status(500).json({ message: 'Erro ao obter clima.' });
    }
  }
}
