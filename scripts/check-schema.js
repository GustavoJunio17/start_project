require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
  const client = await pool.connect();

  try {
    console.log('📋 Estrutura da tabela vagas:\n');

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'vagas'
      ORDER BY ordinal_position
    `);

    console.log('Coluna                    | Tipo              | Nullable');
    console.log('----------------------------------------------------------');
    result.rows.forEach(row => {
      console.log(
        `${row.column_name.padEnd(25)} | ${row.data_type.padEnd(17)} | ${row.is_nullable}`
      );
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
