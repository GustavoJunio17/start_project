require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const check = async () => {
  try {
    const { rows: total } = await pool.query('SELECT COUNT(*) as total FROM candidatos')
    console.log('\n📊 Total de candidatos:', total[0].total)

    const { rows: comScore } = await pool.query(
      'SELECT COUNT(*) as total FROM candidatos WHERE match_score IS NOT NULL'
    )
    console.log('✅ Candidatos com match_score:', comScore[0].total)

    const { rows: comClassif } = await pool.query(
      'SELECT COUNT(*) as total FROM candidatos WHERE classificacao IS NOT NULL'
    )
    console.log('✅ Candidatos com classificação:', comClassif[0].total)

    const { rows: sample } = await pool.query(
      'SELECT nome_completo, match_score, classificacao FROM candidatos LIMIT 5'
    )
    console.log('\n📋 Amostra:')
    sample.forEach(c => {
      console.log(`  ${c.nome_completo}: match=${c.match_score}, classif=${c.classificacao}`)
    })
  } catch (err) {
    console.error('Erro:', err.message)
  } finally {
    await pool.end()
  }
}

check()
