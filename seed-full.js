#!/usr/bin/env node
/**
 * seed-full.js
 * Apaga tudo (exceto superadmin) e cria dados completos para testes.
 *
 * Uso: node seed-full.js
 */

const { Pool } = require('pg')
const crypto = require('crypto')

const pool = new Pool({ connectionString: 'postgresql://startpro:startpro123@localhost:5432/startpro' })

// ──────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────
const uuid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString()

// senha "senha123" — mesmo hash que o app usa (bcrypt seria ideal, mas para seed usamos um hash fixo pré-gerado)
// Hash bcrypt de "senha123" com salt=10
const SENHA_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // "password" — troca se quiser

async function query(sql, params = []) {
  const client = await pool.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}

// ──────────────────────────────────────────────
// 1. LIMPAR
// ──────────────────────────────────────────────
async function limpar() {
  console.log('🗑️  Limpando banco (exceto superadmin)...')
  const SUPERADMIN_ID = '581bec5f-fdf8-4b18-a3fc-fdf78182e361'

  const tabelas = [
    'alertas_automaticos',
    'notificacoes_vaga',
    'treinamentos_ia',
    'onboardings',
    'pdis',
    'agendamentos',
    'feedbacks',
    'respostas_teste',
    'candidatos',
    'candidaturas',
    'colaboradores',
    'convites',
    'gestor_rh_setores',
    'templates_testes',
    'questoes_disc',
    'vagas',
    'cargos_departamentos',
    'teste_links',
  ]

  for (const t of tabelas) {
    await query(`DELETE FROM ${t}`)
    console.log(`  ✓ ${t}`)
  }

  await query(`DELETE FROM users WHERE id != $1`, [SUPERADMIN_ID])
  await query(`DELETE FROM empresas`)
  console.log('  ✓ users (exceto superadmin)')
  console.log('  ✓ empresas')
}

// ──────────────────────────────────────────────
// 2. SEED
// ──────────────────────────────────────────────

const EMPRESAS = [
  { nome: 'TechNova Soluções', segmento: 'Digital', cnpj: '12.345.678/0001-90', plano: 'enterprise' },
  { nome: 'Saúde Total', segmento: 'Saude', cnpj: '98.765.432/0001-11', plano: 'profissional' },
  { nome: 'MegaVarejo SA', segmento: 'Varejo', cnpj: '11.222.333/0001-44', plano: 'profissional' },
  { nome: 'EduFutura', segmento: 'Educacao', cnpj: '55.444.333/0001-22', plano: 'starter' },
  { nome: 'IndustrialPro', segmento: 'Industria', cnpj: '77.888.999/0001-55', plano: 'enterprise' },
]

const DEPARTAMENTOS = ['Tecnologia', 'Vendas', 'Marketing', 'Operações', 'RH', 'Financeiro', 'Suporte', 'Jurídico']

const CARGOS = {
  Tecnologia: ['Desenvolvedor Frontend', 'Desenvolvedor Backend', 'DevOps', 'QA Engineer', 'Product Manager', 'UX Designer'],
  Vendas: ['Executivo de Vendas', 'SDR', 'Account Manager', 'Gerente de Vendas', 'Inside Sales'],
  Marketing: ['Analista de Marketing', 'Social Media', 'Designer Gráfico', 'Copywriter', 'Growth Hacker'],
  Operações: ['Analista de Operações', 'Coordenador de Logística', 'Supervisor de Produção', 'Analista de Processos'],
  RH: ['Analista de RH', 'Recruiter', 'Coordenador de RH', 'HRBP', 'Especialista em Treinamento'],
  Financeiro: ['Analista Financeiro', 'Controller', 'Tesoureiro', 'Analista Contábil'],
  Suporte: ['Analista de Suporte', 'Customer Success', 'Técnico de Suporte N2', 'Supervisor de CS'],
  Jurídico: ['Advogado Pleno', 'Analista Jurídico', 'Paralegal'],
}

const NOMES = [
  'Ana Lima', 'Bruno Carvalho', 'Carla Mendes', 'Diego Santos', 'Elisa Ferreira',
  'Felipe Rocha', 'Gabriela Costa', 'Henrique Oliveira', 'Isabela Nunes', 'João Pereira',
  'Karla Souza', 'Lucas Alves', 'Mariana Silva', 'Nelson Martins', 'Olivia Castro',
  'Paulo Ribeiro', 'Quezia Torres', 'Rafael Gomes', 'Sabrina Dias', 'Thiago Fernandes',
  'Ursula Borges', 'Victor Leal', 'Wanda Araujo', 'Ximena Prado', 'Yago Monteiro',
  'Zara Vieira', 'Alexandre Lima', 'Beatriz Cunha', 'Carlos Eduardo', 'Daniela Melo',
  'Ernesto Figueiredo', 'Fabiana Neto', 'Guilherme Barros', 'Helena Cardoso', 'Igor Teixeira',
  'Juliana Brito', 'Kevin Amaral', 'Larissa Moura', 'Marcelo Vasconcelos', 'Natalia Freitas',
  'Otávio Sampaio', 'Patricia Cavalcanti', 'Quintino Machado', 'Renata Pacheco', 'Sérgio Azevedo',
  'Tatiana Correia', 'Ulisses Campos', 'Vanessa Coelho', 'Wagner Nascimento', 'Xiomara Reis',
]

const DISC_PROFILES = [
  { D: 80, I: 40, S: 30, C: 50 },
  { D: 30, I: 80, S: 60, C: 30 },
  { D: 20, I: 50, S: 85, C: 45 },
  { D: 50, I: 35, S: 40, C: 80 },
  { D: 70, I: 70, S: 25, C: 35 },
  { D: 45, I: 55, S: 55, C: 45 },
  { D: 90, I: 20, S: 15, C: 75 },
  { D: 25, I: 90, S: 40, C: 20 },
]

let nomeIdx = 0
function proximoNome() {
  return NOMES[nomeIdx++ % NOMES.length]
}

let emailCounter = 0
function emailDeNome(nome, dominio) {
  emailCounter++
  const base = nome.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[̀-ͯ]/g, '')
  return base + emailCounter + '@' + dominio
}

function discAleatorio() {
  return DISC_PROFILES[Math.floor(Math.random() * DISC_PROFILES.length)]
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

async function seed() {
  console.log('\n🌱 Iniciando seed completo...\n')

  const empresaIds = []
  const adminUserIds = []
  const gestorIds = []
  const vagaIdsPorEmpresa = {}
  const colaboradorIdsPorEmpresa = {}
  const candidatoIdsPorEmpresa = {}

  // ── EMPRESAS + ADMINS + GESTORES ──────────────────────────────
  console.log('🏢 Criando empresas, admins e gestores...')
  for (const emp of EMPRESAS) {
    const empId = uuid()
    empresaIds.push(empId)
    vagaIdsPorEmpresa[empId] = []
    colaboradorIdsPorEmpresa[empId] = []
    candidatoIdsPorEmpresa[empId] = []

    await query(
      `INSERT INTO empresas (id, nome, segmento, cnpj, email_contato, telefone, status, tema_padrao, plano, data_cadastro)
       VALUES ($1,$2,$3,$4,$5,$6,'ativa','clean',$7,NOW())`,
      [empId, emp.nome, emp.segmento, emp.cnpj, `contato@${emp.nome.toLowerCase().replace(/\s+/g,'')}.com.br`, '(11) 9' + Math.floor(10000000 + Math.random()*90000000), emp.plano]
    )

    // Admin da empresa
    const adminNome = proximoNome()
    const adminId = uuid()
    adminUserIds.push({ id: adminId, empresaId: empId })
    await query(
      `INSERT INTO users (id, email, nome_completo, password_hash, role, empresa_id, ativo, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'admin',$5,true,NOW(),NOW())`,
      [adminId, emailDeNome(adminNome, 'empresa.com'), adminNome, SENHA_HASH, empId]
    )

    // 2 Gestores RH
    for (let g = 0; g < 2; g++) {
      const gestorNome = proximoNome()
      const gestorId = uuid()
      gestorIds.push({ id: gestorId, empresaId: empId })
      await query(
        `INSERT INTO users (id, email, nome_completo, password_hash, role, empresa_id, ativo, created_at, updated_at)
         VALUES ($1,$2,$3,$4,'gestor_rh',$5,true,NOW(),NOW())`,
        [gestorId, emailDeNome(gestorNome, 'empresa.com'), gestorNome, SENHA_HASH, empId]
      )
    }

    console.log(`  ✓ ${emp.nome} (${empId.slice(0,8)})`)
  }

  // ── QUESTÕES DISC GLOBAIS ──────────────────────────────────────
  console.log('\n📋 Criando questões DISC...')
  const questoesIds = []
  const perguntasDisc = [
    { p: 'Em situações de pressão, você:', opcoes: [
      { texto: 'Toma decisões rápidas e age imediatamente', dimensao: 'D' },
      { texto: 'Busca apoio e motivação do time', dimensao: 'I' },
      { texto: 'Mantém a calma e age de forma metódica', dimensao: 'S' },
      { texto: 'Analisa todos os dados antes de agir', dimensao: 'C' },
    ]},
    { p: 'Qual é sua maior força em um projeto?', opcoes: [
      { texto: 'Liderança e resultados rápidos', dimensao: 'D' },
      { texto: 'Motivar e engajar a equipe', dimensao: 'I' },
      { texto: 'Consistência e confiabilidade', dimensao: 'S' },
      { texto: 'Precisão e qualidade', dimensao: 'C' },
    ]},
    { p: 'Como você prefere se comunicar?', opcoes: [
      { texto: 'De forma direta e objetiva', dimensao: 'D' },
      { texto: 'Com entusiasmo e narrativas envolventes', dimensao: 'I' },
      { texto: 'Com paciência e escuta ativa', dimensao: 'S' },
      { texto: 'Com dados e argumentos lógicos', dimensao: 'C' },
    ]},
    { p: 'Ao enfrentar um desafio novo, você:', opcoes: [
      { texto: 'Assume o controle e define o plano', dimensao: 'D' },
      { texto: 'Brainstorm com a equipe cheio de ideias', dimensao: 'I' },
      { texto: 'Segue os processos já estabelecidos', dimensao: 'S' },
      { texto: 'Pesquisa exaustivamente antes de agir', dimensao: 'C' },
    ]},
    { p: 'O que mais te motiva profissionalmente?', opcoes: [
      { texto: 'Atingir metas e superar desafios', dimensao: 'D' },
      { texto: 'Reconhecimento e conexões sociais', dimensao: 'I' },
      { texto: 'Estabilidade e harmonia no ambiente', dimensao: 'S' },
      { texto: 'Aprofundamento técnico e excelência', dimensao: 'C' },
    ]},
    { p: 'Em reuniões você costuma:', opcoes: [
      { texto: 'Liderar a pauta e apressar decisões', dimensao: 'D' },
      { texto: 'Compartilhar ideias e animar o grupo', dimensao: 'I' },
      { texto: 'Ouvir atentamente e colaborar', dimensao: 'S' },
      { texto: 'Questionar e buscar clareza nos detalhes', dimensao: 'C' },
    ]},
    { p: 'Como você reage a críticas?', opcoes: [
      { texto: 'Aceita e parte logo para a solução', dimensao: 'D' },
      { texto: 'Sente bastante mas recupera logo', dimensao: 'I' },
      { texto: 'Processa com calma e adapta', dimensao: 'S' },
      { texto: 'Analisa se a crítica é válida com lógica', dimensao: 'C' },
    ]},
    { p: 'Seu estilo de tomada de decisão é:', opcoes: [
      { texto: 'Rápido e orientado a resultados', dimensao: 'D' },
      { texto: 'Intuitivo e baseado em pessoas', dimensao: 'I' },
      { texto: 'Ponderado e consensual', dimensao: 'S' },
      { texto: 'Sistemático e baseado em evidências', dimensao: 'C' },
    ]},
    { p: 'Em um time, você prefere:', opcoes: [
      { texto: 'Liderar e definir o rumo', dimensao: 'D' },
      { texto: 'Motivar e manter o espírito alto', dimensao: 'I' },
      { texto: 'Garantir harmonia e apoiar todos', dimensao: 'S' },
      { texto: 'Controlar qualidade e processos', dimensao: 'C' },
    ]},
    { p: 'Qual situação te deixa mais desconfortável?', opcoes: [
      { texto: 'Perder o controle ou ser limitado', dimensao: 'D' },
      { texto: 'Ser ignorado ou isolado', dimensao: 'I' },
      { texto: 'Mudanças bruscas e imprevisíveis', dimensao: 'S' },
      { texto: 'Trabalho impreciso ou sem padrão', dimensao: 'C' },
    ]},
    { p: 'Como você organiza seu trabalho?', opcoes: [
      { texto: 'Foco no objetivo, flexível no caminho', dimensao: 'D' },
      { texto: 'De forma criativa e colaborativa', dimensao: 'I' },
      { texto: 'Com rotinas claras e planejadas', dimensao: 'S' },
      { texto: 'Com checklists e documentação detalhada', dimensao: 'C' },
    ]},
    { p: 'Quando aprende algo novo, você prefere:', opcoes: [
      { texto: 'Colocar em prática imediatamente', dimensao: 'D' },
      { texto: 'Discutir com outras pessoas', dimensao: 'I' },
      { texto: 'Aprender de forma gradual e segura', dimensao: 'S' },
      { texto: 'Estudar profundamente toda a teoria', dimensao: 'C' },
    ]},
    { p: 'O que define sua liderança?', opcoes: [
      { texto: 'Resultados e autoridade', dimensao: 'D' },
      { texto: 'Inspiração e carisma', dimensao: 'I' },
      { texto: 'Empatia e consistência', dimensao: 'S' },
      { texto: 'Competência técnica e planejamento', dimensao: 'C' },
    ]},
    { p: 'Em situações de conflito você:', opcoes: [
      { texto: 'Enfrenta diretamente e resolve rápido', dimensao: 'D' },
      { texto: 'Tenta mediar com entusiasmo e positividade', dimensao: 'I' },
      { texto: 'Busca consenso e preserva o relacionamento', dimensao: 'S' },
      { texto: 'Analisa os fatos e apresenta argumentos', dimensao: 'C' },
    ]},
    { p: 'Como você define sucesso?', opcoes: [
      { texto: 'Superar metas ambiciosas', dimensao: 'D' },
      { texto: 'Ser reconhecido e admirado', dimensao: 'I' },
      { texto: 'Criar um ambiente estável e harmonioso', dimensao: 'S' },
      { texto: 'Fazer um trabalho impecável', dimensao: 'C' },
    ]},
    { p: 'Qual é seu ritmo de trabalho preferido?', opcoes: [
      { texto: 'Rápido, intenso e orientado a metas', dimensao: 'D' },
      { texto: 'Dinâmico, social e cheio de interações', dimensao: 'I' },
      { texto: 'Constante, previsível e bem organizado', dimensao: 'S' },
      { texto: 'Cuidadoso, focado e com atenção aos detalhes', dimensao: 'C' },
    ]},
  ]

  for (const q of perguntasDisc) {
    const qid = uuid()
    questoesIds.push(qid)
    await query(
      `INSERT INTO questoes_disc (id, empresa_id, vaga_id, pergunta, opcoes) VALUES ($1,NULL,NULL,$2,$3)`,
      [qid, q.p, JSON.stringify(q.opcoes)]
    )
  }
  console.log(`  ✓ ${questoesIds.length} questões DISC globais`)

  // ── TEMPLATES DE TESTES POR EMPRESA ───────────────────────────
  console.log('\n📝 Criando templates de testes...')
  const templateIdsPorEmpresa = {}
  for (const empId of empresaIds) {
    const tplId = uuid()
    templateIdsPorEmpresa[empId] = tplId
    await query(
      `INSERT INTO templates_testes (id, empresa_id, nome, descricao, questoes_ids, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      [tplId, empId, 'Template DISC Padrão', 'Teste DISC completo com 16 perguntas', questoesIds]
    )
  }
  console.log(`  ✓ ${empresaIds.length} templates criados`)

  // ── CARGOS E DEPARTAMENTOS ──────────────────────────────────────
  console.log('\n🗂️  Criando cargos e departamentos...')
  const cargoDeptIdsPorEmpresa = {}
  for (const empId of empresaIds) {
    cargoDeptIdsPorEmpresa[empId] = []
    // Inserir departamentos
    for (const dept of DEPARTAMENTOS) {
      await query(
        `INSERT INTO cargos_departamentos (id, empresa_id, tipo, nome, ativo, created_at) VALUES ($1,$2,'departamento',$3,true,NOW())`,
        [uuid(), empId, dept]
      )
    }
    // Inserir cargos
    for (const dept of DEPARTAMENTOS) {
      for (const cargo of (CARGOS[dept] || []).slice(0, 3)) {
        const cdId = uuid()
        cargoDeptIdsPorEmpresa[empId].push({ id: cdId, cargo, departamento: dept })
        await query(
          `INSERT INTO cargos_departamentos (id, empresa_id, tipo, nome, ativo, created_at) VALUES ($1,$2,'cargo',$3,true,NOW())`,
          [cdId, empId, cargo]
        )
      }
    }
  }
  console.log(`  ✓ Cargos criados para todas as empresas`)

  // ── VAGAS ──────────────────────────────────────────────────────
  console.log('\n💼 Criando vagas...')
  const VAGAS_TEMPLATE = [
    { titulo: 'Desenvolvedor Frontend React', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'remoto', regime: 'PJ', salario: 8500, skills: ['React', 'TypeScript', 'CSS', 'Next.js'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Desenvolvedor Backend Node.js', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'remoto', regime: 'CLT', salario: 9200, skills: ['Node.js', 'PostgreSQL', 'Docker', 'REST API'], esc: 'Superior', status: 'aberta' },
    { titulo: 'DevOps Engineer', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'hibrido', regime: 'CLT', salario: 11000, skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Executivo de Vendas Sênior', cat: 'Vendas', dept: 'Vendas', modelo: 'presencial', regime: 'CLT', salario: 7000, skills: ['CRM', 'Negociação', 'Prospecção', 'Salesforce'], esc: 'Superior', status: 'aberta' },
    { titulo: 'SDR - Sales Development Rep', cat: 'Vendas', dept: 'Vendas', modelo: 'remoto', regime: 'CLT', salario: 4500, skills: ['Cold Call', 'Email Marketing', 'CRM', 'LinkedIn Sales'], esc: 'EnsinioMedio', status: 'aberta' },
    { titulo: 'Analista de Marketing Digital', cat: 'Marketing', dept: 'Marketing', modelo: 'hibrido', regime: 'CLT', salario: 5500, skills: ['Google Ads', 'Meta Ads', 'SEO', 'Analytics'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Designer UX/UI', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'remoto', regime: 'PJ', salario: 7000, skills: ['Figma', 'Prototyping', 'Design System', 'User Research'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Analista de RH', cat: 'RH', dept: 'RH', modelo: 'presencial', regime: 'CLT', salario: 4800, skills: ['Recrutamento', 'Treinamento', 'Folha de Pagamento', 'HRIS'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Analista Financeiro', cat: 'Financeiro', dept: 'Financeiro', modelo: 'hibrido', regime: 'CLT', salario: 6200, skills: ['Excel Avançado', 'Power BI', 'Contabilidade', 'DRE'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Customer Success Manager', cat: 'Suporte', dept: 'Suporte', modelo: 'remoto', regime: 'CLT', salario: 5800, skills: ['CRM', 'Comunicação', 'Análise de Dados', 'SLA Management'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Product Manager', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'remoto', regime: 'CLT', salario: 13000, skills: ['Product Discovery', 'OKR', 'Roadmap', 'Data Analysis'], esc: 'Superior', status: 'aberta' },
    { titulo: 'Coordenador de Logística', cat: 'Operações', dept: 'Operações', modelo: 'presencial', regime: 'CLT', salario: 6800, skills: ['Supply Chain', 'WMS', 'KPI', 'Gestão de Estoque'], esc: 'Superior', status: 'pausada' },
    { titulo: 'Copywriter Sênior', cat: 'Marketing', dept: 'Marketing', modelo: 'remoto', regime: 'PJ', salario: 5500, skills: ['SEO Writing', 'Brand Voice', 'Storytelling', 'Content Strategy'], esc: 'Superior', status: 'aberta' },
    { titulo: 'QA Engineer', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'remoto', regime: 'CLT', salario: 7500, skills: ['Cypress', 'Playwright', 'API Testing', 'BDD'], esc: 'Superior', status: 'encerrada' },
    { titulo: 'Estagiário de Desenvolvimento', cat: 'Tecnologia', dept: 'Tecnologia', modelo: 'hibrido', regime: 'Estagio', salario: 2000, skills: ['JavaScript', 'HTML', 'CSS', 'Git'], esc: 'Superior', status: 'aberta' },
  ]

  for (const empId of empresaIds) {
    const gestoresDaEmpresa = gestorIds.filter(g => g.empresaId === empId)
    const tplId = templateIdsPorEmpresa[empId]
    const numVagas = 8 + Math.floor(Math.random() * 7) // 8 a 14 vagas por empresa

    for (let v = 0; v < numVagas; v++) {
      const vTemplate = VAGAS_TEMPLATE[v % VAGAS_TEMPLATE.length]
      const vagaId = uuid()
      vagaIdsPorEmpresa[empId].push(vagaId)
      const gestor = gestoresDaEmpresa[v % gestoresDaEmpresa.length]
      const dataLimite = v % 3 === 0 ? daysFromNow(30 + v * 5) : daysFromNow(15 + v * 3)
      const discIdeal = discAleatorio()

      const salBase = vTemplate.salario + Math.floor(Math.random() * 1000 - 500)
      await query(
        `INSERT INTO vagas (
          id, empresa_id, titulo, descricao, requisitos, categoria, departamento,
          perfil_disc_ideal, status, template_testes_id, criado_por,
          modelo_trabalho, regime, salario_minimo, salario_maximo, hard_skills, escolaridade_minima,
          data_limite, quantidade_vagas, beneficios, diferenciais, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW())`,
        [
          vagaId, empId,
          vTemplate.titulo + (v >= VAGAS_TEMPLATE.length ? ` ${Math.floor(v/VAGAS_TEMPLATE.length)+1}` : ''),
          `Buscamos um(a) profissional talentoso(a) para a posição de ${vTemplate.titulo}. Você fará parte de um time dinâmico e terá impacto direto nos resultados do negócio.`,
          `Experiência comprovada na área. Boa comunicação. Trabalho em equipe. Conhecimento em ${vTemplate.skills.slice(0,2).join(' e ')}.`,
          vTemplate.cat,
          vTemplate.dept,
          JSON.stringify(discIdeal),
          vTemplate.status,
          tplId,
          gestor?.id || null,
          vTemplate.modelo,
          vTemplate.regime,
          salBase,
          Math.round(salBase * 1.3),
          vTemplate.skills,
          vTemplate.esc,
          dataLimite,
          1 + Math.floor(Math.random() * 3),
          ['Vale Refeição', 'Plano de Saúde', 'Vale Transporte', 'PLR'],
          'Ambiente colaborativo, oportunidade de crescimento rápido, stack moderna.',
        ]
      )
    }
    console.log(`  ✓ ${numVagas} vagas para empresa ${empId.slice(0,8)}`)
  }

  // ── COLABORADORES ──────────────────────────────────────────────
  console.log('\n👥 Criando colaboradores...')
  for (const empId of empresaIds) {
    const cargosDepto = cargoDeptIdsPorEmpresa[empId]
    const numColabs = 20 + Math.floor(Math.random() * 15) // 20 a 34 por empresa

    for (let c = 0; c < numColabs; c++) {
      const colabId = uuid()
      colaboradorIdsPorEmpresa[empId].push(colabId)
      const nome = proximoNome()
      const cdEntry = cargosDepto[c % cargosDepto.length]
      const disc = discAleatorio()
      const niveis = ['Junior', 'Pleno', 'Senior', 'Specialist']
      const regimes = ['CLT', 'PJ', 'Estagio']
      const modelos = ['remoto', 'hibrido', 'presencial']
      const statusList = ['ativo', 'ativo', 'ativo', 'em_treinamento', 'desligado']
      const status = statusList[Math.floor(Math.random() * statusList.length)]
      const dataContrat = daysAgo(Math.floor(Math.random() * 1095)) // até 3 anos atrás
      const proxReaval = daysFromNow(30 + Math.floor(Math.random() * 150))

      await query(
        `INSERT INTO colaboradores (
          id, empresa_id, nome, cargo, email, telefone, departamento,
          data_contratacao, modelo_trabalho, regime_contrato, nivel,
          salario, hard_skills, escolaridade, origem, status,
          perfil_disc, proxima_reavaliacao
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          colabId, empId, nome, cdEntry.cargo,
          emailDeNome(nome, 'empresa.com'),
          '(11) 9' + Math.floor(10000000 + Math.random()*90000000),
          cdEntry.departamento,
          dataContrat.split('T')[0],
          pick(modelos),
          pick(regimes),
          pick(niveis),
          3000 + Math.floor(Math.random() * 12000),
          pickN(['JavaScript', 'Python', 'SQL', 'Excel', 'PowerPoint', 'Scrum', 'Git', 'Figma', 'Docker', 'AWS'], 3),
          pick(['Medio', 'Superior', 'Pos-graduado']),
          pick(['contratacao_direta', 'importacao_planilha', 'conversao_candidato']),
          status,
          JSON.stringify(disc),
          proxReaval.split('T')[0],
        ]
      )
    }
    console.log(`  ✓ ${numColabs} colaboradores para empresa ${empId.slice(0,8)}`)
  }

  // ── RESPOSTAS DE TESTES (COLABORADORES) ────────────────────────
  console.log('\n🧪 Criando respostas de testes (colaboradores)...')
  for (const empId of empresaIds) {
    const colabs = colaboradorIdsPorEmpresa[empId]
    for (const colabId of colabs) {
      if (Math.random() > 0.3) { // 70% têm teste DISC
        const disc = discAleatorio()
        await query(
          `INSERT INTO respostas_teste (id, colaborador_id, candidato_id, tipo, respostas, resultado, score, duracao_segundos, created_at)
           VALUES ($1,$2,NULL,'disc',$3,$4,NULL,$5,NOW())`,
          [
            uuid(), colabId,
            JSON.stringify({}),
            JSON.stringify(disc),
            180 + Math.floor(Math.random() * 300),
          ]
        )
      }
    }
    console.log(`  ✓ testes DISC para colaboradores da empresa ${empId.slice(0,8)}`)
  }

  // ── USUÁRIOS CANDIDATOS ────────────────────────────────────────
  console.log('\n🙋 Criando usuários candidatos...')
  const candidatoUsersPorEmpresa = {}
  for (const empId of empresaIds) {
    candidatoUsersPorEmpresa[empId] = []
    const numCands = 30 + Math.floor(Math.random() * 25) // 30 a 54 por empresa

    for (let c = 0; c < numCands; c++) {
      const nome = proximoNome()
      const uid = uuid()
      candidatoUsersPorEmpresa[empId].push({ id: uid, nome })
      await query(
        `INSERT INTO users (id, email, nome_completo, password_hash, role, empresa_id, ativo, created_at, updated_at)
         VALUES ($1,$2,$3,$4,'candidato',$5,true,NOW(),NOW())`,
        [uid, emailDeNome(nome, 'gmail.com'), nome, SENHA_HASH, empId]
      )
    }
    console.log(`  ✓ ${numCands} usuários candidatos para empresa ${empId.slice(0,8)}`)
  }

  // ── CANDIDATOS (registros na tabela candidatos) ─────────────────
  console.log('\n📄 Criando candidatos...')
  const statusCandidatura = ['inscrito', 'em_avaliacao', 'entrevista_agendada', 'aprovado', 'reprovado', 'contratado']
  const classificacoes = ['ouro', 'prata', 'bronze', null, null] // null = sem classificação

  for (const empId of empresaIds) {
    const vagasEmpresa = vagaIdsPorEmpresa[empId]
    const usersEmpresa = candidatoUsersPorEmpresa[empId]

    for (const userInfo of usersEmpresa) {
      const candId = uuid()
      candidatoIdsPorEmpresa[empId].push(candId)
      const vagaId = Math.random() > 0.2 ? pick(vagasEmpresa) : null
      const disc = discAleatorio()
      const matchScore = 30 + Math.floor(Math.random() * 65)
      const scoreLogica = Math.random() > 0.5 ? 40 + Math.floor(Math.random() * 55) : null
      const scoreVendas = Math.random() > 0.6 ? 35 + Math.floor(Math.random() * 60) : null
      const status = pick(statusCandidatura)
      const classif = matchScore > 80 ? 'ouro' : matchScore > 65 ? 'prata' : matchScore > 50 ? 'bronze' : null
      const noBanco = Math.random() > 0.5

      await query(
        `INSERT INTO candidatos (
          id, user_id, empresa_id, vaga_id, nome_completo, whatsapp, email,
          cargo_pretendido, status_candidatura, perfil_disc, score_logica,
          score_vendas, match_score, classificacao, disponivel_banco_talentos,
          data_ultimo_teste, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())`,
        [
          candId, userInfo.id, empId, vagaId,
          userInfo.nome,
          '(11) 9' + Math.floor(10000000 + Math.random()*90000000),
          emailDeNome(userInfo.nome, 'gmail.com'),
          pick(Object.values(CARGOS).flat()),
          status,
          JSON.stringify(disc),
          scoreLogica,
          scoreVendas,
          matchScore,
          classif,
          noBanco,
          daysAgo(Math.floor(Math.random() * 60)).split('T')[0],
        ]
      )
    }
    console.log(`  ✓ ${usersEmpresa.length} candidatos para empresa ${empId.slice(0,8)}`)
  }

  // ── RESPOSTAS DE TESTES (CANDIDATOS) ────────────────────────────
  console.log('\n🧪 Criando respostas de testes (candidatos)...')
  for (const empId of empresaIds) {
    const cands = candidatoIdsPorEmpresa[empId]
    for (const candId of cands) {
      if (Math.random() > 0.4) {
        const disc = discAleatorio()
        await query(
          `INSERT INTO respostas_teste (id, colaborador_id, candidato_id, tipo, respostas, resultado, score, duracao_segundos, created_at)
           VALUES ($1,NULL,$2,'disc',$3,$4,NULL,$5,NOW())`,
          [
            uuid(), candId,
            JSON.stringify({}),
            JSON.stringify(disc),
            150 + Math.floor(Math.random() * 420),
          ]
        )
      }
      // Teste de lógica para alguns
      if (Math.random() > 0.6) {
        const score = 30 + Math.floor(Math.random() * 65)
        await query(
          `INSERT INTO respostas_teste (id, colaborador_id, candidato_id, tipo, respostas, resultado, score, duracao_segundos, created_at)
           VALUES ($1,NULL,$2,'logica',$3,$4,$5,$6,NOW())`,
          [
            uuid(), candId,
            JSON.stringify({}),
            JSON.stringify({ acertos: score, total: 20 }),
            score,
            300 + Math.floor(Math.random() * 600),
          ]
        )
      }
    }
    console.log(`  ✓ testes para candidatos da empresa ${empId.slice(0,8)}`)
  }

  // ── FEEDBACKS ─────────────────────────────────────────────────
  console.log('\n💬 Criando feedbacks...')
  const pararesArr = [
    'Atrasar entregas sem comunicar previamente',
    'Interromper colegas durante reuniões',
    'Não documentar alterações no código',
    'Tomar decisões unilaterais sem alinhamento',
    'Responder emails de forma agressiva',
  ]
  const comecarArr = [
    'Compartilhar updates semanais do progresso',
    'Buscar mentoria com profissionais sênior',
    'Documentar processos criados',
    'Participar mais ativamente nas retrospectivas',
    'Estudar inglês técnico',
  ]
  const continuarArr = [
    'Colaborar proativamente com o time',
    'Entregar no prazo com alta qualidade',
    'Trazer soluções criativas para os problemas',
    'Manter comunicação clara e transparente',
    'Demonstrar comprometimento com os resultados',
  ]

  for (const empId of empresaIds) {
    const cands = candidatoIdsPorEmpresa[empId]
    const colabs = colaboradorIdsPorEmpresa[empId]
    const gestoresDaEmpresa = gestorIds.filter(g => g.empresaId === empId)
    const gestor = gestoresDaEmpresa[0]
    if (!gestor) continue

    // Feedbacks para candidatos
    for (const candId of cands.slice(0, 15)) {
      await query(
        `INSERT INTO feedbacks (id, empresa_id, colaborador_id, candidato_id, autor_id, tipo, parar, comecar, continuar, acao, visivel_para_candidato, data_envio, created_at)
         VALUES ($1,$2,NULL,$3,$4,'externo_candidato',$5,$6,$7,$8,$9,NOW(),NOW())`,
        [
          uuid(), empId, candId, gestor.id,
          pick(pararesArr), pick(comecarArr), pick(continuarArr),
          'Agendar reunião de feedback em 2 semanas',
          Math.random() > 0.4,
        ]
      )
    }

    // Feedbacks para colaboradores
    for (const colabId of colabs.slice(0, 12)) {
      await query(
        `INSERT INTO feedbacks (id, empresa_id, colaborador_id, candidato_id, autor_id, tipo, parar, comecar, continuar, acao, visivel_para_candidato, data_envio, created_at)
         VALUES ($1,$2,$3,NULL,$4,'interno_colaborador',$5,$6,$7,$8,false,NOW(),NOW())`,
        [
          uuid(), empId, colabId, gestor.id,
          pick(pararesArr), pick(comecarArr), pick(continuarArr),
          'Revisar PDI no próximo trimestre',
        ]
      )
    }
    console.log(`  ✓ feedbacks para empresa ${empId.slice(0,8)}`)
  }

  // ── AGENDAMENTOS ──────────────────────────────────────────────
  console.log('\n📅 Criando agendamentos...')
  const statusAgend = ['agendado', 'confirmado', 'realizado', 'cancelado']
  const tiposAgend = ['online', 'presencial']

  for (const empId of empresaIds) {
    const cands = candidatoIdsPorEmpresa[empId]
    const gestoresDaEmpresa = gestorIds.filter(g => g.empresaId === empId)
    if (!gestoresDaEmpresa.length || !cands.length) continue

    const numAgend = 8 + Math.floor(Math.random() * 7)
    for (let a = 0; a < numAgend; a++) {
      const candId = pick(cands)
      const gestor = pick(gestoresDaEmpresa)
      const status = pick(statusAgend)
      const tipo = pick(tiposAgend)
      const dataHora = a < 4 ? daysFromNow(a * 3 + 1) : daysAgo(a * 2)

      await query(
        `INSERT INTO agendamentos (id, candidato_id, empresa_id, gestor_responsavel_id, data_hora, tipo, link_reuniao, endereco, status, observacoes, resultado, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
        [
          uuid(), candId, empId, gestor.id,
          dataHora,
          tipo,
          tipo === 'online' ? 'https://meet.google.com/xxx-yyyy-zzz' : null,
          tipo === 'presencial' ? 'Av. Paulista, 1000 - São Paulo, SP' : null,
          status,
          'Entrevista técnica com o time. Por favor chegar 10 min antes.',
          status === 'realizado' ? pick(['Candidato aprovado para próxima fase', 'Perfil não aderiu às expectativas', 'Ótima entrevista, seguimos para proposta']) : null,
        ]
      )
    }
    console.log(`  ✓ agendamentos para empresa ${empId.slice(0,8)}`)
  }

  // ── PDIs ──────────────────────────────────────────────────────
  console.log('\n📊 Criando PDIs...')
  for (const empId of empresaIds) {
    const colabs = colaboradorIdsPorEmpresa[empId]
    for (const colabId of colabs.slice(0, 10)) {
      await query(
        `INSERT INTO pdis (id, colaborador_id, empresa_id, objetivos, prazo, status, acompanhamento, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
        [
          uuid(), colabId, empId,
          JSON.stringify({
            objetivo1: 'Obter certificação em Cloud AWS',
            objetivo2: 'Melhorar habilidades de liderança',
            objetivo3: 'Aprender inglês nível B2',
          }),
          daysFromNow(90 + Math.floor(Math.random() * 180)).split('T')[0],
          pick(['em_andamento', 'em_andamento', 'concluido', 'pendente']),
          JSON.stringify({
            semana1: 'Iniciou curso online',
            semana2: 'Completou módulo 1',
          }),
        ]
      )
    }
    console.log(`  ✓ PDIs para empresa ${empId.slice(0,8)}`)
  }

  // ── ONBOARDINGS ───────────────────────────────────────────────
  console.log('\n🚀 Criando onboardings...')
  for (const empId of empresaIds) {
    const colabs = colaboradorIdsPorEmpresa[empId]
    for (const colabId of colabs.slice(0, 8)) {
      const perc = Math.floor(Math.random() * 100)
      await query(
        `INSERT INTO onboardings (id, colaborador_id, empresa_id, etapas, percentual_concluido, created_at)
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        [
          uuid(), colabId, empId,
          JSON.stringify([
            { titulo: 'Documentação Admissional', concluida: perc > 20, data: perc > 20 ? daysAgo(5) : null },
            { titulo: 'Apresentação à Equipe', concluida: perc > 40, data: perc > 40 ? daysAgo(4) : null },
            { titulo: 'Configuração de Ferramentas', concluida: perc > 60, data: perc > 60 ? daysAgo(3) : null },
            { titulo: 'Treinamento de Cultura', concluida: perc > 75, data: perc > 75 ? daysAgo(2) : null },
            { titulo: 'Primeiro Projeto Entregue', concluida: perc > 90, data: perc > 90 ? daysAgo(1) : null },
          ]),
          perc,
        ]
      )
    }
    console.log(`  ✓ onboardings para empresa ${empId.slice(0,8)}`)
  }

  // ── ALERTAS AUTOMÁTICOS ────────────────────────────────────────
  console.log('\n🔔 Criando alertas automáticos...')
  for (const empId of empresaIds) {
    const gestoresDaEmpresa = gestorIds.filter(g => g.empresaId === empId)
    const cands = candidatoIdsPorEmpresa[empId]
    for (const gestor of gestoresDaEmpresa) {
      for (let i = 0; i < 5; i++) {
        const tipo = pick(['candidato_score_baixo', 'teste_pendente', 'feedback_atrasado', 'reavaliacao_vencida'])
        await query(
          `INSERT INTO alertas_automaticos (id, empresa_id, tipo, destinatario_id, mensagem, lido, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
          [
            uuid(), empId, tipo, gestor.id,
            tipo === 'candidato_score_baixo' ? 'Candidato com score abaixo do esperado na vaga de Desenvolvedor Backend.'
              : tipo === 'teste_pendente' ? 'Candidato ainda não completou o teste DISC. Prazo: 2 dias.'
              : tipo === 'feedback_atrasado' ? 'Feedback de colaborador está atrasado há 7 dias.'
              : 'Reavaliação de colaborador venceu há 3 dias.',
            Math.random() > 0.5,
          ]
        )
      }
    }
    console.log(`  ✓ alertas para empresa ${empId.slice(0,8)}`)
  }

  // ── NOTIFICAÇÕES DE VAGA ───────────────────────────────────────
  console.log('\n📬 Criando notificações de vagas...')
  for (const empId of empresaIds) {
    const cands = candidatoIdsPorEmpresa[empId]
    const vagas = vagaIdsPorEmpresa[empId]
    for (const candId of cands.slice(0, 10)) {
      const vagaId = pick(vagas)
      await query(
        `INSERT INTO notificacoes_vaga (id, candidato_id, vaga_id, empresa_id, motivo_match, visualizada, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
        [
          uuid(), candId, vagaId, empId,
          'Perfil DISC compatível com o perfil ideal da vaga. Score de match: ' + (65 + Math.floor(Math.random() * 30)) + '%',
          Math.random() > 0.4,
        ]
      )
    }
    console.log(`  ✓ notificações para empresa ${empId.slice(0,8)}`)
  }

  // ── CONVITES ──────────────────────────────────────────────────
  console.log('\n📧 Criando convites...')
  for (const empInfo of adminUserIds) {
    for (let i = 0; i < 3; i++) {
      const roles = ['gestor_rh', 'colaborador', 'candidato']
      await query(
        `INSERT INTO convites (id, email, role, empresa_id, token, expira_em, usado, criado_por, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [
          uuid(),
          `convidado${i + 1}@empresa${empresaIds.indexOf(empInfo.empresaId) + 1}.com`,
          pick(roles),
          empInfo.empresaId,
          crypto.randomBytes(32).toString('hex'),
          daysFromNow(7),
          i === 0, // primeiro convite já foi usado
          empInfo.id,
        ]
      )
    }
  }
  console.log(`  ✓ convites criados`)

  // ── RESUMO ─────────────────────────────────────────────────────
  console.log('\n✅ Seed concluído! Resumo:')
  const counts = await Promise.all([
    query('SELECT COUNT(*) FROM empresas'),
    query('SELECT COUNT(*) FROM users WHERE role != $1', ['super_admin']),
    query('SELECT COUNT(*) FROM vagas'),
    query('SELECT COUNT(*) FROM candidatos'),
    query('SELECT COUNT(*) FROM colaboradores'),
    query('SELECT COUNT(*) FROM respostas_teste'),
    query('SELECT COUNT(*) FROM feedbacks'),
    query('SELECT COUNT(*) FROM agendamentos'),
    query('SELECT COUNT(*) FROM questoes_disc'),
    query('SELECT COUNT(*) FROM alertas_automaticos'),
  ])
  const labels = ['empresas', 'users (exceto superadmin)', 'vagas', 'candidatos', 'colaboradores', 'respostas_teste', 'feedbacks', 'agendamentos', 'questoes_disc', 'alertas']
  counts.forEach((r, i) => console.log(`  • ${labels[i]}: ${r.rows[0].count}`))
}

async function main() {
  try {
    await limpar()
    await seed()
  } catch (err) {
    console.error('\n❌ Erro:', err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
