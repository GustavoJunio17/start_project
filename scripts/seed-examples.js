const pool = require('pg').Pool
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')
require('dotenv').config()

const dbPool = new pool({ connectionString: process.env.DATABASE_URL })

function generateId() {
  return crypto.randomUUID()
}

async function seedExamples() {
  try {
    console.log('🌱 Iniciando seed de exemplos...')

    const empresaId = generateId()
    const adminUserId = generateId()
    const gestorUserId = generateId()
    const candidatoUserId = generateId()
    const vagaId = generateId()
    const candidatoId = generateId()

    // Criar empresa
    await dbPool.query(
      `INSERT INTO empresas
       (id, nome, segmento, cnpj, email_contato, telefone, status, tema_padrao, plano, criado_por, data_cadastro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        empresaId,
        'Tech Solutions Brasil',
        'Digital',
        '12.345.678/0001-90',
        'contato@techsolutions.com.br',
        '(11) 98765-4321',
        'ativa',
        'clean',
        'profissional',
        null,
      ]
    )
    console.log('✓ Empresa criada')

    // Criar usuário admin
    const adminPassword = 'Senha@123'
    const adminHashedPassword = await bcryptjs.hash(adminPassword, 10)
    await dbPool.query(
      `INSERT INTO users
       (id, email, nome_completo, role, empresa_id, ativo, tema_preferido, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [adminUserId, 'admin@techsolutions.com.br', 'Admin Exemplo', 'admin', empresaId, true, 'clean']
    )
    console.log('✓ Usuário admin criado: admin@techsolutions.com.br / Senha@123')

    // Criar usuário gestor RH
    const gestorPassword = 'Senha@123'
    const gestorHashedPassword = await bcryptjs.hash(gestorPassword, 10)
    await dbPool.query(
      `INSERT INTO users
       (id, email, nome_completo, role, empresa_id, ativo, tema_preferido, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [gestorUserId, 'gestor@techsolutions.com.br', 'Gestor RH Exemplo', 'gestor_rh', empresaId, true, 'clean']
    )
    console.log('✓ Usuário gestor RH criado: gestor@techsolutions.com.br / Senha@123')

    // Criar usuário candidato
    const candidatoPassword = 'Senha@123'
    const candidatoHashedPassword = await bcryptjs.hash(candidatoPassword, 10)
    await dbPool.query(
      `INSERT INTO users
       (id, email, nome_completo, role, empresa_id, ativo, tema_preferido, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [candidatoUserId, 'candidato@email.com', 'João Silva', 'candidato', null, true, 'clean']
    )
    console.log('✓ Usuário candidato criado: candidato@email.com / Senha@123')

    // Criar vaga
    await dbPool.query(
      `INSERT INTO vagas
       (id, empresa_id, titulo, descricao, requisitos, categoria, status, criado_por, created_at, modelo_trabalho, regime, salario, escolaridade_minima, departamento, quantidade_vagas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13, $14)`,
      [
        vagaId,
        empresaId,
        'Desenvolvedor Full Stack',
        'Procuramos um desenvolvedor experiente em Next.js e PostgreSQL',
        'Experiência com React, Node.js, PostgreSQL',
        'TI',
        'aberta',
        adminUserId,
        'hibrido',
        'CLT',
        8000,
        'Superior',
        'Tecnologia',
        1,
      ]
    )
    console.log('✓ Vaga criada: Desenvolvedor Full Stack')

    // Criar candidato
    await dbPool.query(
      `INSERT INTO candidatos
       (id, user_id, empresa_id, vaga_id, nome_completo, email, cargo_pretendido, status_candidatura, disponivel_banco_talentos, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [candidatoId, candidatoUserId, empresaId, vagaId, 'João Silva', 'candidato@email.com', 'Desenvolvedor Full Stack', 'inscrito', true]
    )
    console.log('✓ Candidato criado: João Silva')

    // Criar candidatura
    const candidaturaId = generateId()
    await dbPool.query(
      `INSERT INTO candidaturas
       (id, vaga_id, nome, email, telefone, pretensao_salarial, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [candidaturaId, vagaId, 'João Silva', 'candidato@email.com', '(11) 99999-8888', '8000', 'pendente']
    )
    console.log('✓ Candidatura criada')

    // Criar colaborador
    const colaboradorId = generateId()
    await dbPool.query(
      `INSERT INTO colaboradores
       (id, empresa_id, nome, cargo, email, status, origem, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [colaboradorId, empresaId, 'Maria Santos', 'Desenvolvedora Sênior', 'maria@techsolutions.com.br', 'ativo', 'contratacao_direta']
    )
    console.log('✓ Colaborador criado: Maria Santos')

    console.log('\n✅ Seed concluído com sucesso!')
    console.log('\n📝 Dados de acesso:')
    console.log('   Admin: admin@techsolutions.com.br / Senha@123')
    console.log('   Gestor RH: gestor@techsolutions.com.br / Senha@123')
    console.log('   Candidato: candidato@email.com / Senha@123')
    console.log('\n💾 IDs gerados (salve para referência):')
    console.log(`   Empresa: ${empresaId}`)
    console.log(`   Vaga: ${vagaId}`)
    console.log(`   Candidato: ${candidatoId}`)

    await dbPool.end()
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message)
    process.exit(1)
  }
}

seedExamples()
