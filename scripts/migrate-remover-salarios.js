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
    console.log('🔄 Substituindo colunas de salário...\n');

    // Remover as colunas antigas
    console.log('🗑️  Removendo colunas antigas...');
    await client.query('ALTER TABLE vagas DROP COLUMN IF EXISTS salario_minimo');
    console.log('✅ salario_minimo removido');

    await client.query('ALTER TABLE vagas DROP COLUMN IF EXISTS salario_maximo');
    console.log('✅ salario_maximo removido');

    // Adicionar a nova coluna de salário
    console.log('📝 Adicionando coluna salario...');
    await client.query('ALTER TABLE vagas ADD COLUMN IF NOT EXISTS salario NUMERIC(10, 2)');
    console.log('✅ salario adicionado');

    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
