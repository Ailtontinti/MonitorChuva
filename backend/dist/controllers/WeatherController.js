"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherController = void 0;
const env_1 = require("../config/env");
const BASE = 'https://api.openweathermap.org/data/2.5';
class WeatherController {
    async current(req, res) {
        try {
            if (!env_1.env.WEATHER_API_KEY?.trim()) {
                return res.status(200).json({
                    temp: 25,
                    description: 'Clima não configurado',
                    tempMax: 31,
                    tempMin: 24,
                    hours: [
                        { time: Math.floor(Date.now() / 1000), temp: 25, pop: 10 },
                        { time: Math.floor(Date.now() / 1000) + 3600, temp: 25, pop: 18 },
                        { time: Math.floor(Date.now() / 1000) + 7200, temp: 25, pop: 25 },
                        { time: Math.floor(Date.now() / 1000) + 10800, temp: 25, pop: 28 }
                    ]
                });
            }
            const lat = String(env_1.env.WEATHER_LAT);
            const lon = String(env_1.env.WEATHER_LON);
            const appid = env_1.env.WEATHER_API_KEY.trim();
            const params = { lat, lon, appid, units: 'metric', lang: 'pt_br' };
            // Current Weather (gratuito) – substitui One Call 2.5 descontinuado
            const currentUrl = `${BASE}/weather?${new URLSearchParams(params)}`;
            const currentResp = await fetch(currentUrl);
            if (!currentResp.ok) {
                const errBody = await currentResp.text();
                console.error('OpenWeather current:', currentResp.status, errBody);
                return res.status(502).json({ message: 'Falha ao consultar clima. Verifique WEATHER_API_KEY e coordenadas.' });
            }
            const currentJson = (await currentResp.json());
            const main = currentJson.main ?? {};
            const temp = main.temp ?? 25;
            const tempMin = main.temp_min ?? temp - 2;
            const tempMax = main.temp_max ?? temp + 2;
            const description = currentJson.weather?.[0]?.description ?? 'N/A';
            const humidity = main.humidity ?? 0;
            const pressure = main.pressure ?? 0;
            const feelsLike = main.feels_like ?? temp;
            const windSpeed = (currentJson.wind?.speed ?? 0) * 3.6; // m/s -> km/h
            const windDeg = currentJson.wind?.deg ?? 0;
            const windDir = (() => {
                const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                const idx = Math.round(windDeg / 45) % 8;
                return dirs[idx];
            })();
            const visibilityKm = (currentJson.visibility ?? 0) / 1000;
            // Previsão 5 dias / 3h (gratuita) – primeiras 4 entradas = próximas horas
            const forecastUrl = `${BASE}/forecast?${new URLSearchParams(params)}`;
            const forecastResp = await fetch(forecastUrl);
            let hours = [];
            if (forecastResp.ok) {
                const forecastJson = (await forecastResp.json());
                const list = (forecastJson.list ?? []).slice(0, 4);
                hours = list.map((h) => ({
                    time: h.dt,
                    temp: h.main?.temp ?? temp,
                    pop: Math.round((h.pop ?? 0) * 100)
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
                uvIndex: 2
            });
        }
        catch (e) {
            console.error('Weather error:', e);
            return res.status(500).json({ message: 'Erro ao obter clima.' });
        }
    }
}
exports.WeatherController = WeatherController;
//# sourceMappingURL=WeatherController.js.map