require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Criando tabela colaborador_teste_links...');
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migration_colaborador_teste_links.sql'),
      'utf8'
    );
    await client.query(sql);
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
