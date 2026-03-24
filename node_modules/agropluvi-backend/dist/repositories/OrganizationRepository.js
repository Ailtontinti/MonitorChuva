"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const db_1 = require("../infra/db");
class OrganizationRepository {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING id`, [data.name, data.slug ?? null]);
        return result.rows[0];
    }
}
exports.OrganizationRepository = OrganizationRepository;
//# sourceMappingURL=OrganizationRepository.js.map