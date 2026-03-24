"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const DashboardController_1 = require("../../controllers/DashboardController");
const controller = new DashboardController_1.DashboardController();
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get('/rain-summary', (req, res) => controller.rainSummary(req, res));
exports.dashboardRouter.get('/rain-gauges-map', (req, res) => controller.rainGaugesMap(req, res));
//# sourceMappingURL=dashboard.routes.js.map