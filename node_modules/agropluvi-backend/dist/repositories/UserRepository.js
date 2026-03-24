"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_1 = require("../infra/db");
class UserRepository {
    async findByEmail(email) {
        const result = await db_1.pool.query(`SELECT id, organization_id AS "organizationId", name, email, password_hash AS "passwordHash",
              role, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`, [email]);
        return result.rows[0] ?? null;
    }
    async findByEmailAndOrganization(email, organizationId) {
        const result = await db_1.pool.query(`SELECT id, organization_id AS "organizationId", name, email, password_hash AS "passwordHash",
              role, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
        WHERE email = $1 AND organization_id = $2`, [email, organizationId]);
        return result.rows[0] ?? null;
    }
    async findById(id, organizationId) {
        const result = await db_1.pool.query(`SELECT id, organization_id AS "organizationId", name, email, password_hash AS "passwordHash",
              role, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
        WHERE id = $1 AND organization_id = $2`, [id, organizationId]);
        return result.rows[0] ?? null;
    }
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO users (organization_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, organization_id AS "organizationId", name, email, password_hash AS "passwordHash",
                 role, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`, [data.organizationId, data.name, data.email, data.passwordHash, data.role ?? 'user']);
        return result.rows[0];
    }
    async listByOrganization(organizationId) {
        const result = await db_1.pool.query(`SELECT id, organization_id AS "organizationId", name, email, password_hash AS "passwordHash",
              role, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
        WHERE organization_id = $1
        ORDER BY created_at DESC`, [organizationId]);
        return result.rows;
    }
    async updateById(id, organizationId, data) {
        const result = await db_1.pool.query(`UPDATE users
          SET role = COALESCE($1, role),
              is_active = COALESCE($2, is_active),
              updated_at = NOW()
        WHERE id = $3 AND organization_id = $4
    RETURNING id, organization_id AS "organizationId", name, email, password_hash AS "passwordHash",
              role, is_active AS "isActive", created_at AS "CreatedAt", updated_at AS "updatedAt"`, [data.role ?? null, data.isActive ?? null, id, organizationId]);
        return result.rows[0] ?? null;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map