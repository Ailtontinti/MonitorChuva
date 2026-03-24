"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainGaugeService = void 0;
const PropertyRepository_1 = require("../repositories/PropertyRepository");
const RainGaugeRepository_1 = require("../repositories/RainGaugeRepository");
class RainGaugeService {
    constructor(rainGaugeRepository = new RainGaugeRepository_1.RainGaugeRepository(), propertyRepository = new PropertyRepository_1.PropertyRepository()) {
        this.rainGaugeRepository = rainGaugeRepository;
        this.propertyRepository = propertyRepository;
    }
    async listByProperty(propertyId, organizationId) {
        const property = await this.propertyRepository.findById(propertyId, organizationId);
        if (!property) {
            throw new Error('Talhão não encontrado para esta organização.');
        }
        return this.rainGaugeRepository.listByProperty(propertyId);
    }
    async create(input) {
        const property = await this.propertyRepository.findById(input.propertyId, input.organizationId);
        if (!property) {
            throw new Error('Talhão não encontrado para esta organização.');
        }
        if (!input.name?.trim()) {
            throw new Error('Nome do pluviômetro é obrigatório.');
        }
        return this.rainGaugeRepository.create({
            propertyId: input.propertyId,
            name: input.name.trim(),
            serialNumber: input.serialNumber ?? null,
            model: input.model ?? null,
            installationDate: input.installationDate ?? null,
            status: input.status ?? 'active',
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null
        });
    }
    async update(input) {
        const property = await this.propertyRepository.findById(input.propertyId, input.organizationId);
        if (!property) {
            throw new Error('Talhão não encontrado para esta organização.');
        }
        const updated = await this.rainGaugeRepository.update(input);
        if (!updated) {
            throw new Error('Pluviômetro não encontrado para este talhão.');
        }
        return updated;
    }
    async delete(id, propertyId, organizationId) {
        const property = await this.propertyRepository.findById(propertyId, organizationId);
        if (!property) {
            throw new Error('Talhão não encontrado para esta organização.');
        }
        const deleted = await this.rainGaugeRepository.delete(id, propertyId);
        if (!deleted) {
            throw new Error('Pluviômetro não encontrado para este talhão.');
        }
    }
}
exports.RainGaugeService = RainGaugeService;
//# sourceMappingURL=RainGaugeService.js.map