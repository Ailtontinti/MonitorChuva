"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainfallRecordService = void 0;
const RainGaugeRepository_1 = require("../repositories/RainGaugeRepository");
const RainfallRecordRepository_1 = require("../repositories/RainfallRecordRepository");
const PropertyRepository_1 = require("../repositories/PropertyRepository");
class RainfallRecordService {
    constructor(rainfallRecordRepository = new RainfallRecordRepository_1.RainfallRecordRepository(), rainGaugeRepository = new RainGaugeRepository_1.RainGaugeRepository(), propertyRepository = new PropertyRepository_1.PropertyRepository()) {
        this.rainfallRecordRepository = rainfallRecordRepository;
        this.rainGaugeRepository = rainGaugeRepository;
        this.propertyRepository = propertyRepository;
    }
    async ensureGaugeBelongsToOrganization(rainGaugeId, organizationId) {
        // Primeiro buscamos o pluviômetro e o talhão via join, garantindo que
        // o pluviômetro pertence a um talhão da organização informada.
        const result = await this.rainGaugeRepository.findWithProperty(rainGaugeId, organizationId);
        if (!result) {
            throw new Error('Pluviômetro não encontrado para esta organização.');
        }
        return { propertyId: result.propertyId };
    }
    async listByRainGauge(rainGaugeId, organizationId, from, to) {
        await this.ensureGaugeBelongsToOrganization(rainGaugeId, organizationId);
        return this.rainfallRecordRepository.listByRainGauge(rainGaugeId, from, to);
    }
    async create(input) {
        if (!Number.isFinite(input.amountMm) || input.amountMm < 0) {
            throw new Error('Valor de chuva (mm) deve ser um número maior ou igual a zero.');
        }
        await this.ensureGaugeBelongsToOrganization(input.rainGaugeId, input.organizationId);
        return this.rainfallRecordRepository.create({
            rainGaugeId: input.rainGaugeId,
            recordedAt: input.recordedAt,
            amountMm: input.amountMm,
            source: input.source ?? null
        });
    }
    async update(input) {
        if (!Number.isFinite(input.input.amountMm) || input.input.amountMm < 0) {
            throw new Error('Valor de chuva (mm) deve ser um número maior ou igual a zero.');
        }
        await this.ensureGaugeBelongsToOrganization(input.rainGaugeId, input.organizationId);
        const updated = await this.rainfallRecordRepository.update({
            id: input.id,
            rainGaugeId: input.rainGaugeId,
            recordedAt: input.input.recordedAt,
            amountMm: input.input.amountMm,
            source: input.input.source ?? null,
        });
        if (!updated) {
            throw new Error('Registro de chuva não encontrado.');
        }
        return updated;
    }
    async delete(input) {
        await this.ensureGaugeBelongsToOrganization(input.rainGaugeId, input.organizationId);
        const deleted = await this.rainfallRecordRepository.delete({
            id: input.id,
            rainGaugeId: input.rainGaugeId,
        });
        if (!deleted) {
            throw new Error('Registro de chuva não encontrado.');
        }
    }
}
exports.RainfallRecordService = RainfallRecordService;
//# sourceMappingURL=RainfallRecordService.js.map