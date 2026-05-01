require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const migrate = async () => {
  const client = await pool.connect()

  try {
    console.log('🔄 Executando migração para gestor_rh_setores...\n')

    const migrationPath = path.join(
      __dirname,
      '../database/migration_gestor_rh_setores.sql',
    )
    const sql = fs.readFileSync(migrationPath, 'utf8')

    await client.query(sql)

    console.log('✅ Migração de gestor_rh_setores concluída com sucesso!')
    console.log('📝 Tabela gestor_rh_setores foi criada com sucesso\n')
  } catch (error) {
    console.error('❌ Erro na migração:', error.message)
    process.exit(1)
  } finally {
    await client.end()
    await pool.end()
  }
}

migrate()
