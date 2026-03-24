import { pool } from '../infra/db';
import { RainfallRecord } from '../models/RainfallRecord';

export interface RainfallRecordInsert {
  rainGaugeId: string;
  recordedAt: Date;
  amountMm: number;
  source?: string | null;
}

export class RainfallRecordRepository {
  async listByRainGauge(
    rainGaugeId: string,
    from?: Date,
    to?: Date
  ): Promise<RainfallRecord[]> {
    const params: unknown[] = [rainGaugeId];
    const conditions: string[] = ['rain_gauge_id = $1'];

    if (from) {
      params.push(from);
      conditions.push(`recorded_at >= $${params.length}`);
    }

    if (to) {
      params.push(to);
      conditions.push(`recorded_at <= $${params.length}`);
    }

    const result = await pool.query<RainfallRecord>(
      `SELECT id,
              rain_gauge_id AS "rainGaugeId",
              recorded_at AS "recordedAt",
              amount_mm AS "amountMm",
              source,
              created_at AS "createdAt"
         FROM rainfall_records
        WHERE ${conditions.join(' AND ')}
        ORDER BY recorded_at DESC`,
      params
    );

    return result.rows;
  }

  async create(data: RainfallRecordInsert): Promise<RainfallRecord> {
    const result = await pool.query<RainfallRecord>(
      `INSERT INTO rainfall_records (
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
         created_at AS "createdAt"`,
      [data.rainGaugeId, data.recordedAt, data.amountMm, data.source ?? null]
    );

    return result.rows[0];
  }

  async update(data: {
    id: string;
    rainGaugeId: string;
    recordedAt: Date;
    amountMm: number;
    source?: string | null;
  }): Promise<RainfallRecord | null> {
    const result = await pool.query<RainfallRecord>(
      `UPDATE rainfall_records
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
        created_at AS "createdAt"`,
      [data.recordedAt, data.amountMm, data.source ?? null, data.id, data.rainGaugeId],
    );

    return result.rows[0] ?? null;
  }

  async delete(data: { id: string; rainGaugeId: string }): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM rainfall_records
          WHERE id = $1
            AND rain_gauge_id = $2`,
      [data.id, data.rainGaugeId],
    );

    return (result.rowCount ?? 0) > 0;
  }
}

