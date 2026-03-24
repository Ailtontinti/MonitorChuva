"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./modules/auth.routes");
const dashboard_routes_1 = require("./modules/dashboard.routes");
const properties_routes_1 = require("./modules/properties.routes");
exports.router = (0, express_1.Router)();
exports.router.use('/auth', auth_routes_1.authRouter);
exports.router.use('/dashboard', dashboard_routes_1.dashboardRouter);
exports.router.use('/properties', properties_routes_1.propertiesRouter);
//# sourceMappingURL=index.js.map