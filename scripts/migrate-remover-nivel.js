require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Removendo coluna nivel da tabela vagas...\n');

    // Remover a coluna
    await client.query('ALTER TABLE vagas DROP COLUMN IF EXISTS nivel');
    console.log('✅ Coluna nivel removida');

    // Remover o enum
    await client.query('DROP TYPE IF EXISTS nivel_profissional');
    console.log('✅ Enum nivel_profissional removido');

    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
