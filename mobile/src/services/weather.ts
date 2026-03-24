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
}

export async function getCurrentWeather(): Promise<WeatherCurrent> {
  const { data } = await axios.get<WeatherCurrent>(
    `${API_BASE_URL}/api/weather/current`
  );
  return data;
}
