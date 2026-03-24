"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertiesRouter = void 0;
const express_1 = require("express");
const PropertyController_1 = require("../../controllers/PropertyController");
const auth_1 = require("../../middleware/auth");
const rainGauges_routes_1 = require("./rainGauges.routes");
const propertyController = new PropertyController_1.PropertyController();
exports.propertiesRouter = (0, express_1.Router)();
exports.propertiesRouter.use(auth_1.authMiddleware);
exports.propertiesRouter.get('/', (req, res) => propertyController.list(req, res));
exports.propertiesRouter.post('/', (req, res) => propertyController.create(req, res));
exports.propertiesRouter.put('/:id', (req, res) => propertyController.update(req, res));
exports.propertiesRouter.delete('/:id', (req, res) => propertyController.delete(req, res));
// Pluviômetros por talhão
exports.propertiesRouter.use('/:propertyId/rain-gauges', rainGauges_routes_1.rainGaugesRouter);
//# sourceMappingURL=properties.routes.js.map