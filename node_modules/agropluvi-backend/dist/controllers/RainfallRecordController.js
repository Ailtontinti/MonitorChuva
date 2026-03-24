"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainfallRecordController = void 0;
const RainfallRecordService_1 = require("../services/RainfallRecordService");
class RainfallRecordController {
    constructor(rainfallRecordService = new RainfallRecordService_1.RainfallRecordService()) {
        this.rainfallRecordService = rainfallRecordService;
    }
    async list(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { rainGaugeId } = req.params;
        const { from, to } = req.query;
        try {
            const fromDate = typeof from === 'string' ? new Date(from) : undefined;
            const toDate = typeof to === 'string' ? new Date(to) : undefined;
            const records = await this.rainfallRecordService.listByRainGauge(rainGaugeId, req.tenant.organizationId, fromDate, toDate);
            return res.status(200).json(records);
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
        const { rainGaugeId } = req.params;
        const { recordedAt, amountMm, source } = req.body;
        try {
            const record = await this.rainfallRecordService.create({
                rainGaugeId,
                organizationId: req.tenant.organizationId,
                recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
                amountMm,
                source
            });
            return res.status(201).json(record);
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
        const { rainGaugeId, id } = req.params;
        const { recordedAt, amountMm, source } = req.body;
        try {
            const record = await this.rainfallRecordService.update({
                rainGaugeId,
                organizationId: req.tenant.organizationId,
                id,
                input: {
                    recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
                    amountMm,
                    source,
                },
            });
            return res.status(200).json(record);
        }
        catch (error) {
            const msg = error.message;
            return res.status(400).json({ message: msg });
        }
    }
    async delete(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        const { rainGaugeId, id } = req.params;
        try {
            await this.rainfallRecordService.delete({
                rainGaugeId,
                organizationId: req.tenant.organizationId,
                id,
            });
            return res.status(204).send();
        }
        catch (error) {
            const msg = error.message;
            return res.status(400).json({ message: msg });
        }
    }
}
exports.RainfallRecordController = RainfallRecordController;
//# sourceMappingURL=RainfallRecordController.js.map