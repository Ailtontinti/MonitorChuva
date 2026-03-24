"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const PropertyService_1 = require("../services/PropertyService");
class PropertyController {
    constructor(propertyService = new PropertyService_1.PropertyService()) {
        this.propertyService = propertyService;
    }
    async list(req, res) {
        if (!req.tenant) {
            return res
                .status(400)
                .json({ message: 'Organização (organization_id) não identificada na requisição.' });
        }
        try {
            const properties = await this.propertyService.list(req.tenant.organizationId);
            return res.status(200).json(properties);
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
        const { name, description, latitude, longitude, metadata } = req.body;
        try {
            const property = await this.propertyService.create({
                organizationId: req.tenant.organizationId,
                name,
                description,
                latitude,
                longitude,
                metadata
            });
            return res.status(201).json(property);
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
        const { id } = req.params;
        const { name, description, latitude, longitude, metadata } = req.body;
        try {
            const property = await this.propertyService.update({
                id,
                organizationId: req.tenant.organizationId,
                name,
                description,
                latitude,
                longitude,
                metadata
            });
            return res.status(200).json(property);
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
        const { id } = req.params;
        try {
            await this.propertyService.delete(id, req.tenant.organizationId);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.PropertyController = PropertyController;
//# sourceMappingURL=PropertyController.js.map