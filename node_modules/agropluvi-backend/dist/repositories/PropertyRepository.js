"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRepository = void 0;
const db_1 = require("../infra/db");
class PropertyRepository {
    async listByOrganization(organizationId) {
        const result = await db_1.pool.query(`SELECT id,
              organization_id AS "organizationId",
              name,
              description,
              latitude,
              longitude,
              metadata,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
         FROM properties
        WHERE organization_id = $1
        ORDER BY name ASC`, [organizationId]);
        return result.rows;
    }
    async findById(id, organizationId) {
        const result = await db_1.pool.query(`SELECT id,
              organization_id AS "organizationId",
              name,
              description,
              latitude,
              longitude,
              metadata,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
         FROM properties
        WHERE id = $1 AND organization_id = $2`, [id, organizationId]);
        return result.rows[0] ?? null;
    }
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO properties (
         organization_id,
         name,
         description,
         latitude,
         longitude,
         metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         organization_id AS "organizationId",
         name,
         description,
         latitude,
         longitude,
         metadata,
         created_at AS "createdAt",
         updated_at AS "updatedAt"`, [
            data.organizationId,
            data.name,
            data.description ?? null,
            data.latitude ?? null,
            data.longitude ?? null,
            data.metadata ?? null
        ]);
        return result.rows[0];
    }
    async update(data) {
        const existing = await this.findById(data.id, data.organizationId);
        if (!existing) {
            return null;
        }
        const merged = {
            ...existing,
            ...('name' in data ? { name: data.name } : {}),
            ...('description' in data ? { description: data.description } : {}),
            ...('latitude' in data ? { latitude: data.latitude } : {}),
            ...('longitude' in data ? { longitude: data.longitude } : {}),
            ...('metadata' in data ? { metadata: data.metadata } : {})
        };
        const result = await db_1.pool.query(`UPDATE properties
          SET name = $1,
              description = $2,
              latitude = $3,
              longitude = $4,
              metadata = $5,
              updated_at = NOW()
        WHERE id = $6 AND organization_id = $7
        RETURNING
          id,
          organization_id AS "organizationId",
          name,
          description,
          latitude,
          longitude,
          metadata,
          created_at AS "createdAt",
          updated_at AS "updatedAt"`, [
            merged.name,
            merged.description ?? null,
            merged.latitude ?? null,
            merged.longitude ?? null,
            merged.metadata ?? null,
            data.id,
            data.organizationId
        ]);
        return result.rows[0] ?? null;
    }
    async delete(id, organizationId) {
        const result = await db_1.pool.query(`DELETE FROM properties
        WHERE id = $1 AND organization_id = $2`, [id, organizationId]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.PropertyRepository = PropertyRepository;
//# sourceMappingURL=PropertyRepository.js.map