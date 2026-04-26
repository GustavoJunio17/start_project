require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixTemplate16() {
  const client = await pool.connect();

  try {
    console.log('🔧 Corrigindo template DISC Padrão para 16 questões...\n');

    // Pega a primeira empresa
    const empresaResult = await client.query('SELECT id FROM empresas LIMIT 1');
    const empresaId = empresaResult.rows[0].id;

    // Adicionar 4 questões faltantes
    const questoes = [
      {
        pergunta: 'Sua motivação principal é:',
        opcoes: [
          { texto: 'Conquistar posições de liderança', dimensao: 'D' },
          { texto: 'Ser reconhecido pelo trabalho', dimensao: 'I' },
          { texto: 'Manter um ambiente harmonioso', dimensao: 'S' },
          { texto: 'Trabalhar com qualidade e excelência', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Em relação a prazos:',
        opcoes: [
          { texto: 'Sempre entrega antes do prazo', dimensao: 'D' },
          { texto: 'Mantém o entusiasmo até o final', dimensao: 'I' },
          { texto: 'Avisa se não conseguir', dimensao: 'S' },
          { texto: 'Planeja para nada dar errado', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Como lida com críticas:',
        opcoes: [
          { texto: 'Vê como defasagem a corrigir', dimensao: 'D' },
          { texto: 'Reflete e aprende rápido', dimensao: 'I' },
          { texto: 'Agradece sinceramente', dimensao: 'S' },
          { texto: 'Quer detalhes para melhorar', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Estilo de liderança:',
        opcoes: [
          { texto: 'Autocrático e focado em resultados', dimensao: 'D' },
          { texto: 'Colaborativo e inspirador', dimensao: 'I' },
          { texto: 'Democrático e inclusivo', dimensao: 'S' },
          { texto: 'Consultivo e baseado em dados', dimensao: 'C' }
        ]
      }
    ];

    let novasQuestoes = [];
    for (const q of questoes) {
      const result = await client.query(
        `INSERT INTO questoes_disc (empresa_id, pergunta, opcoes)
         VALUES ($1, $2, $3) RETURNING id`,
        [empresaId, q.pergunta, JSON.stringify(q.opcoes)]
      );
      novasQuestoes.push(result.rows[0].id);
    }

    // Atualizar o template de 16 questões com as novas questões
    await client.query(`
      UPDATE templates_testes
      SET questoes_ids = array_append(questoes_ids, $1::uuid)
      WHERE nome = 'DISC Padrão - 16 Questões'
    `, [novasQuestoes[0]]);

    await client.query(`
      UPDATE templates_testes
      SET questoes_ids = array_append(questoes_ids, $1::uuid)
      WHERE nome = 'DISC Padrão - 16 Questões'
    `, [novasQuestoes[1]]);

    await client.query(`
      UPDATE templates_testes
      SET questoes_ids = array_append(questoes_ids, $1::uuid)
      WHERE nome = 'DISC Padrão - 16 Questões'
    `, [novasQuestoes[2]]);

    await client.query(`
      UPDATE templates_testes
      SET questoes_ids = array_append(questoes_ids, $1::uuid)
      WHERE nome = 'DISC Padrão - 16 Questões'
    `, [novasQuestoes[3]]);

    // Verificar resultado
    const result = await client.query(`
      SELECT nome, array_length(questoes_ids, 1) as qtd
      FROM templates_testes
      WHERE nome = 'DISC Padrão - 16 Questões'
    `);

    console.log('✅ Template corrigido!');
    console.log(`   Questões agora: ${result.rows[0].qtd}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixTemplate16();
