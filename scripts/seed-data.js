require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const seedData = async () => {
  const client = await pool.connect()

  try {
    console.log('🌱 Iniciando seed de dados...\n')

    // 1. Verificar se existe empresa
    const { rows: empresas } = await client.query('SELECT id, nome FROM empresas LIMIT 1')
    if (empresas.length === 0) {
      console.error('❌ Nenhuma empresa encontrada no banco. Crie uma empresa primeiro.')
      process.exit(1)
    }

    const empresaId = empresas[0].id
    console.log(`✓ Usando empresa: ${empresas[0].nome} (${empresaId})\n`)

    // 2. Verificar se já existem cargos_departamentos
    const { rows: existingCargos } = await client.query(
      'SELECT COUNT(*) as count FROM cargos_departamentos WHERE empresa_id = $1',
      [empresaId],
    )

    if (parseInt(existingCargos[0].count) > 0) {
      console.log('⚠️  Cargos e departamentos já existem. Pulando...\n')
    } else {
      // Inserir cargos
      console.log('📋 Criando cargos...')
      const cargos = [
        { nome: 'Desenvolvedor Senior', descricao: 'Desenvolvedor experiente em full-stack' },
        { nome: 'Desenvolvedor Pleno', descricao: 'Desenvolvedor com 2-5 anos de experiência' },
        { nome: 'Desenvolvedor Junior', descricao: 'Desenvolvedor iniciante, em aprendizado' },
        { nome: 'Product Manager', descricao: 'Gerenciador de produtos' },
        { nome: 'Designer UX/UI', descricao: 'Designer de experiência e interface' },
        { nome: 'Gerente de Projetos', descricao: 'Responsável pela gestão de projetos' },
      ]

      for (const cargo of cargos) {
        await client.query(
          `INSERT INTO cargos_departamentos (empresa_id, tipo, nome, descricao, ativo)
           VALUES ($1, 'cargo', $2, $3, true)`,
          [empresaId, cargo.nome, cargo.descricao],
        )
      }
      console.log(`✓ ${cargos.length} cargos criados\n`)

      // Inserir departamentos
      console.log('🏢 Criando departamentos...')
      const departamentos = [
        { nome: 'Engenharia', descricao: 'Desenvolvimento de software' },
        { nome: 'Design', descricao: 'Design e experiência do usuário' },
        { nome: 'Produto', descricao: 'Gestão de produtos' },
        { nome: 'RH', descricao: 'Recursos Humanos' },
        { nome: 'Financeiro', descricao: 'Gestão financeira' },
      ]

      for (const depto of departamentos) {
        await client.query(
          `INSERT INTO cargos_departamentos (empresa_id, tipo, nome, descricao, ativo)
           VALUES ($1, 'departamento', $2, $3, true)`,
          [empresaId, depto.nome, depto.descricao],
        )
      }
      console.log(`✓ ${departamentos.length} departamentos criados\n`)
    }

    // 3. Criar gestor RH de exemplo
    console.log('👤 Criando gestor RH de exemplo...')
    const gestorEmail = `gestor-rh-demo@empresa.com`

    // Verificar se já existe
    const { rows: existingGestor } = await client.query('SELECT id FROM users WHERE email = $1', [
      gestorEmail,
    ])

    if (existingGestor.length === 0) {
      const senha = await bcrypt.hash('Demo1234', 10)
      const { rows: gestorRows } = await client.query(
        `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone, ativo)
         VALUES ($1, $2, $3, $4::role_type, $5, $6, true)
         RETURNING id`,
        [gestorEmail, senha, 'João Gestor de RH', 'gestor_rh', empresaId, '(11) 98765-4321'],
      )

      const gestorId = gestorRows[0].id

      // Atribuir departamentos ao gestor
      const { rows: deptos } = await client.query(
        `SELECT id FROM cargos_departamentos
         WHERE empresa_id = $1 AND tipo = 'departamento'
         LIMIT 3`,
        [empresaId],
      )

      for (const depto of deptos) {
        await client.query(
          `INSERT INTO gestor_rh_setores (user_id, empresa_id, cargos_departamento_id)
           VALUES ($1, $2, $3)`,
          [gestorId, empresaId, depto.id],
        )
      }

      console.log(`✓ Gestor RH criado: ${gestorEmail}`)
      console.log(`  Senha: Demo1234`)
      console.log(`  Setores: ${deptos.length} departamentos atribuídos\n`)
    } else {
      console.log(`⚠️  Gestor RH já existe\n`)
    }

    // 4. Criar colaboradores de exemplo
    console.log('👥 Criando colaboradores de exemplo...')
    const { rows: deptos } = await client.query(
      `SELECT id, nome FROM cargos_departamentos
       WHERE empresa_id = $1 AND tipo = 'departamento'
       ORDER BY nome`,
      [empresaId],
    )

    const { rows: cargosData } = await client.query(
      `SELECT nome FROM cargos_departamentos
       WHERE empresa_id = $1 AND tipo = 'cargo'
       ORDER BY nome`,
      [empresaId],
    )

    const colaboradores = [
      {
        nome: 'Maria Silva',
        email: 'maria.silva@empresa.com',
        cargo: cargosData[0]?.nome || 'Desenvolvedor Senior',
        departamento: deptos[0]?.nome || 'Engenharia',
        status: 'ativo',
      },
      {
        nome: 'Pedro Santos',
        email: 'pedro.santos@empresa.com',
        cargo: cargosData[1]?.nome || 'Desenvolvedor Pleno',
        departamento: deptos[0]?.nome || 'Engenharia',
        status: 'ativo',
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@empresa.com',
        cargo: cargosData[2]?.nome || 'Designer UX/UI',
        departamento: deptos[1]?.nome || 'Design',
        status: 'ativo',
      },
      {
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@empresa.com',
        cargo: 'Gerente de Projetos',
        departamento: deptos[2]?.nome || 'Produto',
        status: 'em_treinamento',
      },
    ]

    let colaboradoresCount = 0
    for (const colab of colaboradores) {
      const { rows: existing } = await client.query('SELECT id FROM colaboradores WHERE email = $1', [
        colab.email,
      ])

      if (existing.length === 0) {
        await client.query(
          `INSERT INTO colaboradores (
            empresa_id, nome, email, telefone, cargo, setor,
            status, origem, data_contratacao
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            empresaId,
            colab.nome,
            colab.email,
            '(11) 99999-' + String(1000 + Math.floor(Math.random() * 8999)).slice(-4),
            colab.cargo,
            colab.departamento,
            colab.status,
            'contratacao_direta',
            new Date().toISOString().split('T')[0],
          ],
        )
        colaboradoresCount++
      }
    }
    console.log(`✓ ${colaboradoresCount} colaboradores criados\n`)

    // 5. Criar vagas de exemplo
    console.log('💼 Criando vagas de exemplo...')
    const vagas = [
      {
        titulo: 'Desenvolvedor React Senior',
        cargo: cargosData[0]?.nome || 'Desenvolvedor Senior',
        departamento: deptos[0]?.nome || 'Engenharia',
        descricao: 'Buscamos um desenvolvedor React experiente para liderar projetos frontend',
        status: 'aberta',
        salario: 12000,
      },
      {
        titulo: 'Designer UX/UI Pleno',
        cargo: cargosData[2]?.nome || 'Designer UX/UI',
        departamento: deptos[1]?.nome || 'Design',
        descricao: 'Procuramos designer experiente em UX/UI para novos projetos',
        status: 'aberta',
        salario: 8000,
      },
      {
        titulo: 'Product Manager Sênior',
        cargo: 'Product Manager',
        departamento: deptos[2]?.nome || 'Produto',
        descricao: 'Liderança de estratégia de produto e roadmap',
        status: 'pausada',
        salario: 10000,
      },
    ]

    let vagasCount = 0
    for (const vaga of vagas) {
      const { rows: existing } = await client.query('SELECT id FROM vagas WHERE titulo = $1', [
        vaga.titulo,
      ])

      if (existing.length === 0) {
        await client.query(
          `INSERT INTO vagas (
            empresa_id, titulo, cargo, departamento, descricao, status, salario_minimo, salario_maximo,
            modelo_trabalho, regime, escolaridade_minima
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            empresaId,
            vaga.titulo,
            vaga.cargo,
            vaga.departamento,
            vaga.descricao,
            vaga.status,
            vaga.salario,
            vaga.salario * 1.2,
            'hibrido',
            'CLT',
            'Superior',
          ],
        )
        vagasCount++
      }
    }
    console.log(`✓ ${vagasCount} vagas criadas\n`)

    // 6. Criar candidaturas de exemplo
    console.log('📝 Criando candidaturas de exemplo...')
    const { rows: vagasData } = await client.query(
      `SELECT id, titulo FROM vagas WHERE empresa_id = $1 AND status = 'aberta' LIMIT 3`,
      [empresaId],
    )

    const candidaturas = [
      {
        vaga_id: vagasData[0]?.id,
        nome: 'João Developer',
        email: 'joao.dev@gmail.com',
        telefone: '(11) 98765-4321',
        mensagem: 'Tenho 8 anos de experiência com React e Node.js',
        status: 'lido',
      },
      {
        vaga_id: vagasData[0]?.id,
        nome: 'Lucas Frontend',
        email: 'lucas.frontend@gmail.com',
        telefone: '(11) 99876-5432',
        mensagem: 'Experiência com React, TypeScript e Next.js',
        status: 'pendente',
      },
      {
        vaga_id: vagasData[0]?.id,
        nome: 'Amanda React',
        email: 'amanda.react@gmail.com',
        telefone: '(21) 98765-4321',
        mensagem: 'Senior React developer, contribuo em projetos open source',
        status: 'lido',
      },
      {
        vaga_id: vagasData[1]?.id,
        nome: 'Sofia Design',
        email: 'sofia.design@gmail.com',
        telefone: '(11) 97654-3210',
        mensagem: 'Designer UX/UI com 5 anos de experiência em startups',
        status: 'pendente',
      },
      {
        vaga_id: vagasData[1]?.id,
        nome: 'Marina UX',
        email: 'marina.ux@gmail.com',
        telefone: '(85) 98765-4321',
        mensagem: 'Especialista em design systems e UX research',
        status: 'rejeito',
      },
    ]

    let candidaturasCount = 0
    for (const cand of candidaturas) {
      if (!cand.vaga_id) continue

      const { rows: existing } = await client.query(
        'SELECT id FROM candidaturas WHERE email = $1 AND vaga_id = $2',
        [cand.email, cand.vaga_id],
      )

      if (existing.length === 0) {
        await client.query(
          `INSERT INTO candidaturas (vaga_id, nome, email, telefone, mensagem, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [cand.vaga_id, cand.nome, cand.email, cand.telefone, cand.mensagem, cand.status],
        )
        candidaturasCount++
      }
    }
    console.log(`✓ ${candidaturasCount} candidaturas criadas\n`)

    console.log('✅ Seed concluído com sucesso!\n')
    console.log('📝 Dados criados:')
    console.log(`   • Empresa: ${empresas[0].nome}`)
    console.log(`   • Cargos: ${cargosData.length}`)
    console.log(`   • Departamentos: ${deptos.length}`)
    console.log(`   • Gestor RH: gestor-rh-demo@empresa.com`)
    console.log(`   • Colaboradores: ${colaboradoresCount}`)
    console.log(`   • Vagas: ${vagasCount}`)
    console.log(`   • Candidaturas: ${candidaturasCount}`)
    console.log('\n🎯 Próximos passos:')
    console.log('   1. Execute: npm run dev')
    console.log('   2. Abra http://localhost:3000/auth/login')
    console.log('   3. Faça login com:')
    console.log('      Email: gestor-rh-demo@empresa.com')
    console.log('      Senha: Demo1234')
    console.log('   4. Navegue para Configurações > Equipe de RH')
    console.log('   5. Teste a criação de novo Gestor RH\n')

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
    await pool.end()
  }
}

seedData()
