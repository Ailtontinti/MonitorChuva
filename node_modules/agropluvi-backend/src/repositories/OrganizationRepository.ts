import { pool } from '../infra/db';

export interface OrganizationInsert {
  name: string;
  slug?: string | null;
}

export class OrganizationRepository {
  async create(data: OrganizationInsert): Promise<{ id: string }> {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING id`,
      [data.name, data.slug ?? null]
    );
    return result.rows[0];
  }
}
