"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainfallRecordRepository = void 0;
const db_1 = require("../infra/db");
class RainfallRecordRepository {
    async listByRainGauge(rainGaugeId, from, to) {
        const params = [rainGaugeId];
        const conditions = ['rain_gauge_id = $1'];
        if (from) {
            params.push(from);
            conditions.push(`recorded_at >= $${params.length}`);
        }
        if (to) {
            params.push(to);
            conditions.push(`recorded_at <= $${params.length}`);
        }
        const result = await db_1.pool.query(`SELECT id,
              rain_gauge_id AS "rainGaugeId",
              recorded_at AS "recordedAt",
              amount_mm AS "amountMm",
              source,
              created_at AS "createdAt"
         FROM rainfall_records
        WHERE ${conditions.join(' AND ')}
        ORDER BY recorded_at DESC`, params);
        return result.rows;
    }
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO rainfall_records (
         rain_gauge_id,
         recorded_at,
         amount_mm,
         source
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         rain_gauge_id AS "rainGaugeId",
         recorded_at AS "recordedAt",
         amount_mm AS "amountMm",
         source,
         created_at AS "createdAt"`, [data.rainGaugeId, data.recordedAt, data.amountMm, data.source ?? null]);
        return result.rows[0];
    }
    async update(data) {
        const result = await db_1.pool.query(`UPDATE rainfall_records
          SET recorded_at = $1,
              amount_mm = $2,
              source = $3
        WHERE id = $4
          AND rain_gauge_id = $5
      RETURNING
        id,
        rain_gauge_id AS "rainGaugeId",
        recorded_at AS "recordedAt",
        amount_mm AS "amountMm",
        source,
        created_at AS "createdAt"`, [data.recordedAt, data.amountMm, data.source ?? null, data.id, data.rainGaugeId]);
        return result.rows[0] ?? null;
    }
    async delete(data) {
        const result = await db_1.pool.query(`DELETE FROM rainfall_records
          WHERE id = $1
            AND rain_gauge_id = $2`, [data.id, data.rainGaugeId]);
        return result.rowCount > 0;
    }
}
exports.RainfallRecordRepository = RainfallRecordRepository;
//# sourceMappingURL=RainfallRecordRepository.js.map