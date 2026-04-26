require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedForUserEmpresa() {
  const client = await pool.connect();

  try {
    console.log('🔍 Procurando empresa "Discord" ou usuário empresa...\n');

    // Buscar a empresa "Discord" ou qualquer empresa user_empresa
    const empresaResult = await client.query(`
      SELECT id, nome FROM empresas
      WHERE nome ILIKE '%discord%' OR nome ILIKE '%user empresa%'
      LIMIT 1
    `);

    let empresaId;
    if (empresaResult.rows.length > 0) {
      empresaId = empresaResult.rows[0].id;
      console.log(`✅ Encontrada empresa: ${empresaResult.rows[0].nome}`);
    } else {
      // Se não encontrar, usar a que tem mais usuários user_empresa
      const userEmpresaResult = await client.query(`
        SELECT empresa_id, COUNT(*) as count
        FROM users
        WHERE role = 'user_empresa'
        GROUP BY empresa_id
        ORDER BY count DESC
        LIMIT 1
      `);

      if (userEmpresaResult.rows.length > 0) {
        empresaId = userEmpresaResult.rows[0].empresa_id;
        const nomeEmpresaResult = await client.query(
          'SELECT nome FROM empresas WHERE id = $1',
          [empresaId]
        );
        console.log(`✅ Usando empresa com mais user_empresa: ${nomeEmpresaResult.rows[0].nome}`);
      } else {
        console.log('❌ Nenhuma empresa encontrada');
        return;
      }
    }

    console.log(`📍 Empresa ID: ${empresaId}\n`);

    // Verificar se já existem templates para essa empresa
    const existingResult = await client.query(
      'SELECT COUNT(*) as count FROM templates_testes WHERE empresa_id = $1',
      [empresaId]
    );

    if (existingResult.rows[0].count > 0) {
      console.log(`⚠️  Essa empresa já possui ${existingResult.rows[0].count} template(s).`);
      console.log('🗑️  Removendo templates antigos para recriar...\n');
      await client.query('DELETE FROM templates_testes WHERE empresa_id = $1', [empresaId]);
    }

    // Criar as 3 questões base (10, 16, 20)
    console.log('📝 Criando questões DISC...\n');

    // =============================================
    // TEMPLATE 10 QUESTÕES
    // =============================================
    const q_10 = [];

    const q1_10 = [
      { texto: 'Tomar decisões rápidas', dimensao: 'D' },
      { texto: 'Inspirar e motivar as pessoas', dimensao: 'I' },
      { texto: 'Ouvir todos com paciência', dimensao: 'S' },
      { texto: 'Analisar dados detalhadamente', dimensao: 'C' }
    ];
    let result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Em reuniões, você prefere:', JSON.stringify(q1_10)]
    );
    q_10.push(result.rows[0].id);

    const q2_10 = [
      { texto: 'Agir com determinação', dimensao: 'D' },
      { texto: 'Manter a calma e otimismo', dimensao: 'I' },
      { texto: 'Apoiar colegas em dificuldade', dimensao: 'S' },
      { texto: 'Revisar processos cuidadosamente', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Sob pressão, você tende a:', JSON.stringify(q2_10)]
    );
    q_10.push(result.rows[0].id);

    const q3_10 = [
      { texto: 'Liderando o projeto', dimensao: 'D' },
      { texto: 'Compartilhando ideias criativas', dimensao: 'I' },
      { texto: 'Em equipe harmoniosamente', dimensao: 'S' },
      { texto: 'Seguindo processos estabelecidos', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Como você prefere trabalhar:', JSON.stringify(q3_10)]
    );
    q_10.push(result.rows[0].id);

    const q4_10 = [
      { texto: 'Direto e competitivo', dimensao: 'D' },
      { texto: 'Entusiasmado e comunicativo', dimensao: 'I' },
      { texto: 'Leal e confiável', dimensao: 'S' },
      { texto: 'Atencioso com detalhes', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Seus colegas o descrevem como:', JSON.stringify(q4_10)]
    );
    q_10.push(result.rows[0].id);

    const q5_10 = [
      { texto: 'Quer logo colocar em prática', dimensao: 'D' },
      { texto: 'Fica empolgado com as possibilidades', dimensao: 'I' },
      { texto: 'Gosta de entender com calma', dimensao: 'S' },
      { texto: 'Precisa de explicações precisas', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Ao aprender algo novo, você:', JSON.stringify(q5_10)]
    );
    q_10.push(result.rows[0].id);

    const q6_10 = [
      { texto: 'Abraça desafios novos rapidamente', dimensao: 'D' },
      { texto: 'Vê oportunidades de crescimento', dimensao: 'I' },
      { texto: 'Prefere estabilidade e segurança', dimensao: 'S' },
      { texto: 'Quer entender cada mudança bem', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Quanto a mudanças, você:', JSON.stringify(q6_10)]
    );
    q_10.push(result.rows[0].id);

    const q7_10 = [
      { texto: 'Enfrenta direto o problema', dimensao: 'D' },
      { texto: 'Tenta encontrar uma solução criativa', dimensao: 'I' },
      { texto: 'Busca harmonia e consenso', dimensao: 'S' },
      { texto: 'Analisas os fatos antes de agir', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Em conflitos, você normalmente:', JSON.stringify(q7_10)]
    );
    q_10.push(result.rows[0].id);

    const q8_10 = [
      { texto: 'Atinge seus objetivos ambiciosos', dimensao: 'D' },
      { texto: 'Inspira e motiva outras pessoas', dimensao: 'I' },
      { texto: 'Contribui para um grupo unido', dimensao: 'S' },
      { texto: 'Completa tarefas com excelência', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Você se sente realizado quando:', JSON.stringify(q8_10)]
    );
    q_10.push(result.rows[0].id);

    const q9_10 = [
      { texto: 'Focar no resultado final rápido', dimensao: 'D' },
      { texto: 'Pensar em estratégias inovadoras', dimensao: 'I' },
      { texto: 'Incluir todos no processo', dimensao: 'S' },
      { texto: 'Planejar cada detalhe minuciosamente', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Sua abordagem ao planejamento é:', JSON.stringify(q9_10)]
    );
    q_10.push(result.rows[0].id);

    const q10_10 = [
      { texto: 'Discordar se achar injusto', dimensao: 'D' },
      { texto: 'Ver como oportunidade de crescimento', dimensao: 'I' },
      { texto: 'Apreciar se dado com gentileza', dimensao: 'S' },
      { texto: 'Querer dados específicos e evidências', dimensao: 'C' }
    ];
    result = await client.query(
      'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
      [empresaId, 'Com feedback crítico, você tende a:', JSON.stringify(q10_10)]
    );
    q_10.push(result.rows[0].id);

    // Criar template 10 questões
    await client.query(
      `INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids)
       VALUES ($1, $2, $3, $4::uuid[])`,
      [
        empresaId,
        'DISC Rápido - 10 Questões',
        'Avaliação DISC simplificada com 10 questões - ideal para triagem inicial',
        q_10
      ]
    );

    // =============================================
    // TEMPLATE 16 QUESTÕES
    // =============================================
    const q_16 = [...q_10]; // Começar com as 10 do template anterior

    const q_extra = [
      {
        pergunta: 'Em uma crise organizacional:',
        opcoes: [
          { texto: 'Assume o controle da situação', dimensao: 'D' },
          { texto: 'Comunica otimismo à equipe', dimensao: 'I' },
          { texto: 'Apoia colegas em dificuldade', dimensao: 'S' },
          { texto: 'Identifica raiz do problema', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Relação com autoridade:',
        opcoes: [
          { texto: 'Questiona se discordar', dimensao: 'D' },
          { texto: 'Mantém relacionamento positivo', dimensao: 'I' },
          { texto: 'Respeita hierarquia', dimensao: 'S' },
          { texto: 'Segue protocolos estabelecidos', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Seu ambiente ideal de trabalho é:',
        opcoes: [
          { texto: 'Competitivo e desafiador', dimensao: 'D' },
          { texto: 'Criativo e colaborativo', dimensao: 'I' },
          { texto: 'Estável e previsível', dimensao: 'S' },
          { texto: 'Organizado e estruturado', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Para alcançar metas, você:',
        opcoes: [
          { texto: 'Vai além dos limites', dimensao: 'D' },
          { texto: 'Motiva a equipe', dimensao: 'I' },
          { texto: 'Trabalha de forma sustentável', dimensao: 'S' },
          { texto: 'Segue processos eficientes', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Quando há mudança de plano:',
        opcoes: [
          { texto: 'Adapta-se rapidamente e move adiante', dimensao: 'D' },
          { texto: 'Vê nova oportunidade excitante', dimensao: 'I' },
          { texto: 'Quer apoio da equipe', dimensao: 'S' },
          { texto: 'Precisa entender a razão', dimensao: 'C' }
        ]
      },
      {
        pergunta: 'Comunicação preferida:',
        opcoes: [
          { texto: 'Direto e objetivo', dimensao: 'D' },
          { texto: 'Envolvente e positiva', dimensao: 'I' },
          { texto: 'Empática e atenciosa', dimensao: 'S' },
          { texto: 'Precisa e documentada', dimensao: 'C' }
        ]
      }
    ];

    for (const q of q_extra) {
      result = await client.query(
        'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
        [empresaId, q.pergunta, JSON.stringify(q.opcoes)]
      );
      q_16.push(result.rows[0].id);
    }

    // Criar template 16 questões
    await client.query(
      `INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids)
       VALUES ($1, $2, $3, $4::uuid[])`,
      [
        empresaId,
        'DISC Padrão - 16 Questões',
        'Avaliação DISC completa com 16 questões - recomendado para seleção',
        q_16
      ]
    );

    // =============================================
    // TEMPLATE 20 QUESTÕES
    // =============================================
    const q_20 = [...q_16]; // Começar com as 16 do template anterior

    const q_extra_20 = [
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

    for (const q of q_extra_20) {
      result = await client.query(
        'INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES ($1, $2, $3) RETURNING id',
        [empresaId, q.pergunta, JSON.stringify(q.opcoes)]
      );
      q_20.push(result.rows[0].id);
    }

    // Criar template 20 questões
    await client.query(
      `INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids)
       VALUES ($1, $2, $3, $4::uuid[])`,
      [
        empresaId,
        'DISC Completo - 20 Questões',
        'Avaliação DISC detalhada com 20 questões - ideal para análise aprofundada',
        q_20
      ]
    );

    console.log('✅ Templates DISC criados com sucesso!\n');
    console.log('📊 Templates criados:');
    console.log('   1️⃣  DISC Rápido - 10 questões');
    console.log('   2️⃣  DISC Padrão - 16 questões');
    console.log('   3️⃣  DISC Completo - 20 questões\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedForUserEmpresa();
