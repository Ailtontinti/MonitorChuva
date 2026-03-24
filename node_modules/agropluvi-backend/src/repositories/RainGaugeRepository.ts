import { pool } from '../infra/db';
import { RainGauge, RainGaugeStatus } from '../models/RainGauge';

export interface RainGaugeInsert {
  propertyId: string;
  name: string;
  serialNumber?: string | null;
  model?: string | null;
  installationDate?: Date | null;
  status?: RainGaugeStatus;
  latitude?: number | null;
  longitude?: number | null;
}

export interface RainGaugeUpdate {
  id: string;
  propertyId: string;
  name?: string;
  serialNumber?: string | null;
  model?: string | null;
  installationDate?: Date | null;
  status?: RainGaugeStatus;
  latitude?: number | null;
  longitude?: number | null;
}

export class RainGaugeRepository {
  async listByProperty(propertyId: string): Promise<RainGauge[]> {
    const result = await pool.query<RainGauge>(
      `SELECT id,
              property_id AS "propertyId",
              name,
              serial_number AS "serialNumber",
              model,
              installation_date AS "installationDate",
              status,
              latitude,
              longitude,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
         FROM rain_gauges
        WHERE property_id = $1
        ORDER BY name ASC`,
      [propertyId]
    );

    return result.rows;
  }

  async findById(id: string, propertyId: string): Promise<RainGauge | null> {
    const result = await pool.query<RainGauge>(
      `SELECT id,
              property_id AS "propertyId",
              name,
              serial_number AS "serialNumber",
              model,
              installation_date AS "installationDate",
              status,
              latitude,
              longitude,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
         FROM rain_gauges
        WHERE id = $1 AND property_id = $2`,
      [id, propertyId]
    );

    return result.rows[0] ?? null;
  }

  async findWithProperty(
    id: string,
    organizationId: string
  ): Promise<{ id: string; propertyId: string } | null> {
    const result = await pool.query<{ id: string; propertyId: string }>(
      `SELECT g.id,
              g.property_id AS "propertyId"
         FROM rain_gauges g
         JOIN properties p ON p.id = g.property_id
        WHERE g.id = $1
          AND p.organization_id = $2`,
      [id, organizationId]
    );

    return result.rows[0] ?? null;
  }

  async create(data: RainGaugeInsert): Promise<RainGauge> {
    const result = await pool.query<RainGauge>(
      `INSERT INTO rain_gauges (
         property_id,
         name,
         serial_number,
         model,
         installation_date,
         status,
         latitude,
         longitude
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING
         id,
         property_id AS "propertyId",
         name,
         serial_number AS "serialNumber",
         model,
         installation_date AS "installationDate",
         status,
         latitude,
         longitude,
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [
        data.propertyId,
        data.name,
        data.serialNumber ?? null,
        data.model ?? null,
        data.installationDate ?? null,
        data.status ?? 'active',
        data.latitude ?? null,
        data.longitude ?? null
      ]
    );

    return result.rows[0];
  }

  async update(data: RainGaugeUpdate): Promise<RainGauge | null> {
    const existing = await this.findById(data.id, data.propertyId);
    if (!existing) {
      return null;
    }

    const merged = {
      ...existing,
      ...('name' in data ? { name: data.name } : {}),
      ...('serialNumber' in data ? { serialNumber: data.serialNumber } : {}),
      ...('model' in data ? { model: data.model } : {}),
      ...('installationDate' in data ? { installationDate: data.installationDate } : {}),
      ...('status' in data ? { status: data.status } : {}),
      ...('latitude' in data ? { latitude: data.latitude } : {}),
      ...('longitude' in data ? { longitude: data.longitude } : {})
    };

    const result = await pool.query<RainGauge>(
      `UPDATE rain_gauges
          SET name = $1,
              serial_number = $2,
              model = $3,
              installation_date = $4,
              status = $5,
              latitude = $6,
              longitude = $7,
              updated_at = NOW()
        WHERE id = $8 AND property_id = $9
        RETURNING
          id,
          property_id AS "propertyId",
          name,
          serial_number AS "serialNumber",
          model,
          installation_date AS "installationDate",
          status,
          latitude,
          longitude,
          created_at AS "createdAt",
          updated_at AS "updatedAt"`,
      [
        merged.name,
        merged.serialNumber ?? null,
        merged.model ?? null,
        merged.installationDate ?? null,
        merged.status,
        merged.latitude ?? null,
        merged.longitude ?? null,
        data.id,
        data.propertyId
      ]
    );

    return result.rows[0] ?? null;
  }

  async delete(id: string, propertyId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM rain_gauges
        WHERE id = $1 AND property_id = $2`,
      [id, propertyId]
    );

    return (result.rowCount ?? 0) > 0;
  }
}

