"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rainGaugesRouter = void 0;
const express_1 = require("express");
const RainGaugeController_1 = require("../../controllers/RainGaugeController");
const rainfallRecords_routes_1 = require("./rainfallRecords.routes");
const rainGaugeController = new RainGaugeController_1.RainGaugeController();
exports.rainGaugesRouter = (0, express_1.Router)({ mergeParams: true });
exports.rainGaugesRouter.get('/', (req, res) => rainGaugeController.list(req, res));
exports.rainGaugesRouter.post('/', (req, res) => rainGaugeController.create(req, res));
exports.rainGaugesRouter.put('/:id', (req, res) => rainGaugeController.update(req, res));
exports.rainGaugesRouter.delete('/:id', (req, res) => rainGaugeController.delete(req, res));
// Registros de chuva por pluviômetro
exports.rainGaugesRouter.use('/:rainGaugeId/rainfall-records', rainfallRecords_routes_1.rainfallRecordsRouter);
//# sourceMappingURL=rainGauges.routes.js.map