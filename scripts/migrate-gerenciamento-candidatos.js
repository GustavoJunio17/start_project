require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Migração: gerenciamento de candidatos\n');
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migration_gerenciamento_candidatos.sql'),
      'utf8',
    );
    await client.query(sql);
    console.log('✅ Migração concluída\n');
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
