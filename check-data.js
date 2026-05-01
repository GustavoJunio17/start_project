require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const check = async () => {
  try {
    const { rows: empresas } = await pool.query('SELECT id, nome FROM empresas LIMIT 1')
    console.log('Empresa:', empresas[0].nome, empresas[0].id)

    const { rows: cargos } = await pool.query(
      `SELECT * FROM cargos_departamentos WHERE tipo = 'cargo' AND empresa_id = $1 ORDER BY nome`,
      [empresas[0].id]
    )
    console.log(`\nCargos (${cargos.length}):`)
    cargos.forEach(c => console.log(`  - ${c.nome}`))

    const { rows: depts } = await pool.query(
      `SELECT * FROM cargos_departamentos WHERE tipo = 'departamento' AND empresa_id = $1 ORDER BY nome`,
      [empresas[0].id]
    )
    console.log(`\nDepartamentos (${depts.length}):`)
    depts.forEach(d => console.log(`  - ${d.nome}`))
  } catch (err) {
    console.error('Erro:', err.message)
  } finally {
    await pool.end()
  }
}

check()
