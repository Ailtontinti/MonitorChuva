"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const db_1 = require("../infra/db");
class DashboardRepository {
    async getRainGaugesWithCoords(organizationId) {
        const result = await db_1.pool.query(`SELECT g.id,
              g.property_id AS "propertyId",
              g.name,
              g.latitude AS "latitude",
              g.longitude AS "longitude"
         FROM rain_gauges g
         JOIN properties p ON p.id = g.property_id
        WHERE p.organization_id = $1
          AND g.latitude IS NOT NULL
          AND g.longitude IS NOT NULL`, [organizationId]);
        return result.rows;
    }
    async getRainSummary(organizationId, days) {
        const result = await db_1.pool.query(`SELECT
         to_char(date_trunc('day', rr.recorded_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS date,
         COALESCE(SUM(rr.amount_mm), 0)::double precision AS "totalMm"
       FROM rainfall_records rr
       JOIN rain_gauges g ON g.id = rr.rain_gauge_id
       JOIN properties p ON p.id = g.property_id
       WHERE p.organization_id = $1
         AND rr.recorded_at >= (NOW() AT TIME ZONE 'UTC') - ($2::int || ' days')::interval
       GROUP BY date_trunc('day', rr.recorded_at AT TIME ZONE 'UTC')
       ORDER BY date_trunc('day', rr.recorded_at AT TIME ZONE 'UTC') ASC`, [organizationId, days]);
        return result.rows;
    }
}
exports.DashboardRepository = DashboardRepository;
//# sourceMappingURL=DashboardRepository.js.map