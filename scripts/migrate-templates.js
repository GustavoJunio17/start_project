require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando migração de templates de testes...\n');

    // Ler a migração
    const migrationPath = path.join(__dirname, '../database/migration_templates_testes.sql');
    let sql = fs.readFileSync(migrationPath, 'utf8');

    // Verificar se a função get_user_empresa_id existe
    const funcCheck = await client.query(`
      SELECT 1 FROM information_schema.routines
      WHERE routine_name = 'get_user_empresa_id'
    `);

    // Se a função não existe, remover apenas as políticas RLS
    if (funcCheck.rows.length === 0) {
      console.log('⚠️  Função get_user_empresa_id() não encontrada');
      console.log('📝 Removendo políticas RLS que dependem dela...\n');

      // Remove the entire RLS section (from "ALTER TABLE templates_testes ENABLE ROW LEVEL SECURITY" onwards)
      const rlsStartIndex = sql.indexOf('-- RLS Policies');
      if (rlsStartIndex !== -1) {
        sql = sql.substring(0, rlsStartIndex).trim() + ';';
      }
    }

    await client.query(sql);

    console.log('✅ Migração de templates de testes concluída com sucesso!');
    console.log('📝 A coluna template_testes_id foi adicionada à tabela vagas');
    console.log('💡 Se precisar de RLS, rode: npm run db:init\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
