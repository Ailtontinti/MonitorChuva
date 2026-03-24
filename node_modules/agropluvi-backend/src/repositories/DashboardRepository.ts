import { pool } from '../infra/db';

export interface RainSummaryRow {
  date: string;
  totalMm: number;
}

export interface RainGaugeMapItem {
  id: string;
  propertyId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export class DashboardRepository {
  async getRainGaugesWithCoords(organizationId: string): Promise<RainGaugeMapItem[]> {
    const result = await pool.query<RainGaugeMapItem>(
      `SELECT g.id,
              g.property_id AS "propertyId",
              g.name,
              g.latitude AS "latitude",
              g.longitude AS "longitude"
         FROM rain_gauges g
         JOIN properties p ON p.id = g.property_id
        WHERE p.organization_id = $1
          AND g.latitude IS NOT NULL
          AND g.longitude IS NOT NULL`,
      [organizationId]
    );
    return result.rows;
  }

  async getRainSummary(organizationId: string, days: number): Promise<RainSummaryRow[]> {
    const result = await pool.query<RainSummaryRow>(
      `SELECT
         to_char(date_trunc('day', rr.recorded_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS date,
         COALESCE(SUM(rr.amount_mm), 0)::double precision AS "totalMm"
       FROM rainfall_records rr
       JOIN rain_gauges g ON g.id = rr.rain_gauge_id
       JOIN properties p ON p.id = g.property_id
       WHERE p.organization_id = $1
         AND rr.recorded_at >= (NOW() AT TIME ZONE 'UTC') - ($2::int || ' days')::interval
       GROUP BY date_trunc('day', rr.recorded_at AT TIME ZONE 'UTC')
       ORDER BY date_trunc('day', rr.recorded_at AT TIME ZONE 'UTC') ASC`,
      [organizationId, days]
    );
    return result.rows;
  }
}
