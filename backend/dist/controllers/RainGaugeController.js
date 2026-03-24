"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainGaugeController = void 0;
const RainGaugeService_1 = require("../services/RainGaugeService");
class RainGaugeController {
    constructor(rainGaugeService = new RainGaugeService_1.RainGaugeService()) {
        this.rainGaugeService = rainGaugeService;
    }
    async list(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { propertyId } = req.params;
        try {
            const gauges = await this.rainGaugeService.listByProperty(propertyId, req.tenant.organizationId);
            return res.status(200).json(gauges);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async create(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { propertyId } = req.params;
        const { name, serialNumber, model, installationDate, status, latitude, longitude } = req.body;
        try {
            const gauge = await this.rainGaugeService.create({
                propertyId,
                organizationId: req.tenant.organizationId,
                name,
                serialNumber,
                model,
                installationDate: installationDate ? new Date(installationDate) : null,
                status,
                latitude: latitude != null ? Number(latitude) : null,
                longitude: longitude != null ? Number(longitude) : null
            });
            return res.status(201).json(gauge);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async update(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { propertyId, id } = req.params;
        const { name, serialNumber, model, installationDate, status, latitude, longitude } = req.body;
        try {
            const gauge = await this.rainGaugeService.update({
                id,
                propertyId,
                organizationId: req.tenant.organizationId,
                name,
                serialNumber,
                model,
                installationDate: installationDate ? new Date(installationDate) : null,
                status,
                latitude: latitude != null ? Number(latitude) : undefined,
                longitude: longitude != null ? Number(longitude) : undefined
            });
            return res.status(200).json(gauge);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async delete(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { propertyId, id } = req.params;
        try {
            await this.rainGaugeService.delete(id, propertyId, req.tenant.organizationId);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.RainGaugeController = RainGaugeController;
//# sourceMappingURL=RainGaugeController.js.map