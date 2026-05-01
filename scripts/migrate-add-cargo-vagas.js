require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando migração para adicionar cargo em vagas...\n');

    const migrationPath = path.join(__dirname, '../database/migration_add_cargo_vagas.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.query(sql);

    console.log('✅ Migração concluída com sucesso!');
    console.log('📝 Campo cargo foi adicionado à tabela vagas\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
