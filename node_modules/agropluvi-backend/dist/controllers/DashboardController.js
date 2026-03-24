"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardService_1 = require("../services/DashboardService");
class DashboardController {
    constructor(service = new DashboardService_1.DashboardService()) {
        this.service = service;
    }
    async rainSummary(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const days = Number(req.query.days ?? 7);
        try {
            const data = await this.service.rainSummary(req.tenant.organizationId, days);
            return res.status(200).json(data);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async rainGaugesMap(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        try {
            const data = await this.service.rainGaugesForMap(req.tenant.organizationId);
            return res.status(200).json(data);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=DashboardController.js.map