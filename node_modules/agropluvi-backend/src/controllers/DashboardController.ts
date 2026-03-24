import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  constructor(private readonly service = new DashboardService()) {}

  async rainSummary(req: Request, res: Response): Promise<Response> {
    if (!req.tenant) {
      return res
        .status(400)
        .json({ message: 'Organização (organization_id) não identificada na requisição.' });
    }
    const days = Number(req.query.days ?? 7);
    try {
      const data = await this.service.rainSummary(req.tenant.organizationId, days);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  async rainGaugesMap(req: Request, res: Response): Promise<Response> {
    if (!req.tenant) {
      return res
        .status(400)
        .json({ message: 'Organização (organization_id) não identificada na requisição.' });
    }
    try {
      const data = await this.service.rainGaugesForMap(req.tenant.organizationId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
}
