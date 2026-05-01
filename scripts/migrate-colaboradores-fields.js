require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../database/migration_colaboradores_missing_fields.sql'),
    'utf8'
  )
  const client = await pool.connect()
  try {
    await client.query(sql)
    console.log('Migration aplicada com sucesso.')
  } catch (err) {
    if (err.code === '42701') {
      console.log('Colunas já existem, nada a fazer.')
    } else {
      console.error('Erro na migration:', err.message)
      process.exit(1)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

run()
