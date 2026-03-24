/**
 * Adiciona as colunas latitude e longitude na tabela rain_gauges.
 * Execute: npx ts-node -r dotenv/config scripts/run-lat-lng-migration.ts
 */
import { pool } from '../src/infra/db';

async function run() {
  try {
    await pool.query(`
      ALTER TABLE rain_gauges
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
    `);
    console.log('Colunas latitude e longitude adicionadas em rain_gauges.');
  } catch (e) {
    console.error('Erro na migração:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
