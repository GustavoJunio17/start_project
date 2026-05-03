require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const crypto = require('crypto')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const seed = async () => {
  try {
    const { rows: empresas } = await pool.query('SELECT id FROM empresas LIMIT 1')
    if (!empresas.length) {
      console.log('❌ Nenhuma empresa encontrada.')
      await pool.end()
      return
    }
    const empresa_id = empresas[0].id

    const { rows: vagas } = await pool.query(
      'SELECT id FROM vagas WHERE empresa_id = $1 LIMIT 1',
      [empresa_id]
    )
    const vaga_id = vagas.length ? vagas[0].id : null

    // Criar usuários candidatos
    const candidatos = [
      { nome: 'João Silva', email: 'joao.silva@example.com', match: 95, classif: 'ouro' },
      { nome: 'Maria Santos', email: 'maria.santos@example.com', match: 87, classif: 'prata' },
      { nome: 'Pedro Oliveira', email: 'pedro.oliveira@example.com', match: 78, classif: 'prata' },
      { nome: 'Ana Costa', email: 'ana.costa@example.com', match: 65, classif: 'bronze' },
      { nome: 'Carlos Mendes', email: 'carlos.mendes@example.com', match: 52, classif: 'bronze' },
    ]

    for (const c of candidatos) {
      const user_id = crypto.randomUUID()
      
      // Criar usuário
      await pool.query(
        `INSERT INTO users (id, email, nome_completo, role, ativo)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, c.email, c.nome, 'candidato', true]
      )

      // Criar candidato
      await pool.query(
        `INSERT INTO candidatos (id, user_id, empresa_id, vaga_id, nome_completo, email, 
         cargo_pretendido, match_score, classificacao, status_candidatura)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          crypto.randomUUID(),
          user_id,
          empresa_id,
          vaga_id,
          c.nome,
          c.email,
          'Developer',
          c.match,
          c.classif,
          'em_avaliacao'
        ]
      )
    }

    console.log('✅ 5 candidatos de teste criados!')
    console.log('\nDados inseridos:')
    candidatos.forEach(c => {
      console.log(`  • ${c.nome} - Match: ${c.match}% | Classif: ${c.classif}`)
    })

  } catch (err) {
    console.error('❌ Erro:', err.message)
  } finally {
    await pool.end()
  }
}

seed()
