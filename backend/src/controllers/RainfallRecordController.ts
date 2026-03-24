import { Request, Response } from 'express';

import { RainfallRecordService } from '../services/RainfallRecordService';

export class RainfallRecordController {
  constructor(private readonly rainfallRecordService = new RainfallRecordService()) {}

  async list(req: Request, res: Response): Promise<Response> {
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

      const records = await this.rainfallRecordService.listByRainGauge(
        rainGaugeId,
        req.tenant.organizationId,
        fromDate,
        toDate
      );

      return res.status(200).json(records);
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
    } catch (error) {
      const msg = (error as Error).message;
      return res.status(400).json({ message: msg });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      const msg = (error as Error).message;
      return res.status(400).json({ message: msg });
    }
  }
}

