require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const SQL_DIR = path.join(__dirname, '../database')

// Ordem importa — dependências primeiro
const MIGRATIONS = [
  'migration_vaga_workflow.sql',
  'migration_add_vaga_fields.sql',
  'migration_adicionar_campos_vagas.sql',
  'migration_candidaturas.sql',
  'migration_alter_candidaturas.sql',
  'migration_templates_testes.sql',
  'migration_links_testes.sql',
  'migration_add_colaboradores_fields.sql',
  'migration_adicionar_nivel_colaboradores.sql',
  'migration_add_colaborador_to_respostas.sql',
  'migration_cargos_departamentos.sql',
  'migration_gestor_rh_setores.sql',
  'migration_add_gestor_rh_role.sql',
  'migration_add_cargo_vagas.sql',
  'migration_seed_disc_templates.sql',
]

async function runAll() {
  const client = await pool.connect()
  let ok = 0
  let skip = 0

  for (const file of MIGRATIONS) {
    const filePath = path.join(SQL_DIR, file)
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado, pulando: ${file}`)
      skip++
      continue
    }

    const sql = fs.readFileSync(filePath, 'utf8')
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('COMMIT')
      console.log(`✅ ${file}`)
      ok++
    } catch (err) {
      await client.query('ROLLBACK')
      // Ignora erros de "já existe" (coluna/tabela/enum duplicado)
      const msg = err.message || ''
      if (
        msg.includes('already exists') ||
        msg.includes('duplicate column') ||
        msg.includes('já existe')
      ) {
        console.log(`⏭️  ${file} (já aplicado, pulando)`)
        skip++
      } else {
        console.error(`❌ ${file}: ${msg}`)
      }
    }
  }

  client.release()
  await pool.end()
  console.log(`\nPronto: ${ok} aplicadas, ${skip} puladas.`)
}

runAll().catch(console.error)
