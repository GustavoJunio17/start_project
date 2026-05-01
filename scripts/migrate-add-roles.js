require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const migrate = async () => {
  const client = await pool.connect()

  try {
    console.log('🔄 Adicionando roles ao enum role_type...\n')

    // Tentar adicionar cada role (IF NOT EXISTS evita erro se já existir)
    const roles = ['gestor_rh', 'admin', 'super_gestor']

    for (const role of roles) {
      try {
        await client.query(`ALTER TYPE role_type ADD VALUE '${role}' BEFORE 'colaborador'`)
        console.log(`✓ Role '${role}' adicionado`)
      } catch (err) {
        // Role já existe, continue
        if (err.message.includes('already exists')) {
          console.log(`⚠️  Role '${role}' já existe`)
        } else {
          console.log(`⚠️  Erro ao adicionar '${role}': ${err.message}`)
        }
      }
    }

    console.log('\n✅ Migração concluída!\n')
  } catch (error) {
    console.error('❌ Erro na migração:', error.message)
    process.exit(1)
  } finally {
    await client.end()
    await pool.end()
  }
}

migrate()
