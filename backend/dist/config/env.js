"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const required = (value, key) => {
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
    }
    return value;
};
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT ?? 3001),
    JWT_SECRET: required(process.env.JWT_SECRET, 'JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
    DATABASE_URL: required(process.env.DATABASE_URL, 'DATABASE_URL'),
    DB_SSL: process.env.DB_SSL === 'true',
    WEATHER_API_KEY: (process.env.WEATHER_API_KEY ?? '').trim(),
    WEATHER_LAT: Number(process.env.WEATHER_LAT ?? -23.5505),
    WEATHER_LON: Number(process.env.WEATHER_LON ?? -46.6333)
};
//# sourceMappingURL=env.js.map