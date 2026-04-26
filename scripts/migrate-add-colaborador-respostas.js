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
    console.log('🔄 Adicionando suporte a testes de colaboradores...\n');

    const migrationPath = path.join(__dirname, '../database/migration_add_colaborador_to_respostas.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.query(sql);

    console.log('✅ Migração concluída com sucesso!');
    console.log('📝 Campo colaborador_id adicionado a respostas_teste');
    console.log('🔐 Constraint adicionado: pelo menos candidato_id ou colaborador_id deve estar preenchido\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
