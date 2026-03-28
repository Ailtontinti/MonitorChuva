import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface WeatherHour {
  time: number;
  temp: number;
  pop: number;
}

export interface WeatherCurrent {
  temp: number;
  description: string;
  tempMax: number;
  tempMin: number;
  hours: WeatherHour[];
  humidity: number;
  pressure: number;
  feelsLike: number;
  windSpeedKmH: number;
  windDirection: string;
  visibilityKm: number;
  uvIndex: number;
  /** Chuva acumulada hoje (mm) no ponto consultado (ex.: GPS + Open-Meteo). */
  rainTodayMm?: number;
  rainYesterdayMm?: number | null;
  /** true quando lat/lon vieram do dispositivo (query). */
  rainFromGps?: boolean;
}

export interface WeatherLocationParams {
  latitude: number;
  longitude: number;
  timeZone: string;
  localToday: string;
  localYesterday: string;
}

export async function getCurrentWeather(location?: WeatherLocationParams): Promise<WeatherCurrent> {
  const qs = new URLSearchParams();
  if (location) {
    qs.set('lat', String(location.latitude));
    qs.set('lon', String(location.longitude));
    qs.set('tz', location.timeZone);
    qs.set('today', location.localToday);
    qs.set('yesterday', location.localYesterday);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const { data } = await axios.get<WeatherCurrent>(`${API_BASE_URL}/api/weather/current${suffix}`);
  return data;
}
