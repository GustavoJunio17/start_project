require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verify() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando templates da empresa Discord...\n');

    // Buscar a empresa Discord
    const empresaResult = await client.query(
      `SELECT id, nome FROM empresas WHERE nome ILIKE '%discord%' LIMIT 1`
    );

    if (empresaResult.rows.length === 0) {
      console.log('❌ Empresa Discord não encontrada');
      return;
    }

    const empresaId = empresaResult.rows[0].id;
    console.log(`✅ Empresa: ${empresaResult.rows[0].nome}`);
    console.log(`📍 ID: ${empresaId}\n`);

    // Buscar templates
    const result = await client.query(`
      SELECT id, nome, descricao, array_length(questoes_ids, 1) as qtd_questoes, created_at
      FROM templates_testes
      WHERE empresa_id = $1
      ORDER BY created_at DESC
    `, [empresaId]);

    if (result.rows.length === 0) {
      console.log('❌ Nenhum template encontrado');
      return;
    }

    console.log(`✅ ${result.rows.length} template(s) encontrado(s):\n`);
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.nome}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Questões: ${row.qtd_questoes || 0}`);
      console.log(`   Descrição: ${row.descricao}\n`);
    });

  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify();
