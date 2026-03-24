import { Request, Response } from 'express';

import { PropertyService } from '../services/PropertyService';

export class PropertyController {
  constructor(private readonly propertyService = new PropertyService()) {}

  async list(req: Request, res: Response): Promise<Response> {
    if (!req.tenant) {
      return res
        .status(400)
        .json({ message: 'Organização (organization_id) não identificada na requisição.' });
    }

    try {
      const properties = await this.propertyService.list(req.tenant.organizationId);
      return res.status(200).json(properties);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    if (!req.tenant) {
      return res
        .status(400)
        .json({ message: 'Organização (organization_id) não identificada na requisição.' });
    }

    const { id } = req.params;

    try {
      await this.propertyService.delete(id, req.tenant.organizationId);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
}

