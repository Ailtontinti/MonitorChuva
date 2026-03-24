"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherRouter = void 0;
const express_1 = require("express");
const WeatherController_1 = require("../../controllers/WeatherController");
const controller = new WeatherController_1.WeatherController();
exports.weatherRouter = (0, express_1.Router)();
exports.weatherRouter.get('/current', (req, res) => controller.current(req, res));
//# sourceMappingURL=weather.routes.js.map