"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rainfallRecordsRouter = void 0;
const express_1 = require("express");
const RainfallRecordController_1 = require("../../controllers/RainfallRecordController");
const rainfallRecordController = new RainfallRecordController_1.RainfallRecordController();
exports.rainfallRecordsRouter = (0, express_1.Router)({ mergeParams: true });
exports.rainfallRecordsRouter.get('/', (req, res) => rainfallRecordController.list(req, res));
exports.rainfallRecordsRouter.post('/', (req, res) => rainfallRecordController.create(req, res));
exports.rainfallRecordsRouter.patch('/:id', (req, res) => rainfallRecordController.update(req, res));
exports.rainfallRecordsRouter.delete('/:id', (req, res) => rainfallRecordController.delete(req, res));
//# sourceMappingURL=rainfallRecords.routes.js.map