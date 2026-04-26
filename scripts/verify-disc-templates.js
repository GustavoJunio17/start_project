require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verify() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando templates DISC criados...\n');

    // Buscar templates
    const result = await client.query(`
      SELECT id, nome, descricao, array_length(questoes_ids, 1) as qtd_questoes, created_at
      FROM templates_testes
      ORDER BY created_at DESC
      LIMIT 3
    `);

    if (result.rows.length === 0) {
      console.log('❌ Nenhum template encontrado');
      return;
    }

    console.log('✅ Templates encontrados:\n');
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.nome}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Questões: ${row.qtd_questoes || 0}`);
      console.log(`   Descrição: ${row.descricao}`);
      console.log(`   Criado em: ${row.created_at}\n`);
    });

    // Buscar quantidade total de questões criadas
    const questionsResult = await client.query(`
      SELECT COUNT(*) as total FROM questoes_disc
    `);
    console.log(`📊 Total de questões DISC no banco: ${questionsResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify();
