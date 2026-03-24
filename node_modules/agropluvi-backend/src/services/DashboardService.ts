import {
  DashboardRepository,
  RainGaugeMapItem,
  RainSummaryRow
} from '../repositories/DashboardRepository';

export class DashboardService {
  constructor(private readonly repo = new DashboardRepository()) {}

  async rainSummary(organizationId: string, days: number): Promise<RainSummaryRow[]> {
    const safeDays = Number.isFinite(days) && days > 0 && days <= 60 ? days : 7;
    return this.repo.getRainSummary(organizationId, safeDays);
  }

  async rainGaugesForMap(organizationId: string): Promise<RainGaugeMapItem[]> {
    return this.repo.getRainGaugesWithCoords(organizationId);
  }
}
