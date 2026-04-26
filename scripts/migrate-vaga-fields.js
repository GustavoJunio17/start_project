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
    console.log('🔄 Iniciando migração de campos de vagas...\n');

    const migrationPath = path.join(__dirname, '../database/migration_add_vaga_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.query(sql);

    console.log('✅ Migração de campos de vagas concluída com sucesso!');
    console.log('📝 As seguintes colunas foram adicionadas à tabela vagas:');
    console.log('   - modelo_trabalho, regime, salario');
    console.log('   - hard_skills, idiomas, beneficios');
    console.log('   - escolaridade_minima, departamento, data_limite');
    console.log('   - quantidade_vagas, diferenciais, perguntas_triagem');
    console.log('   - template_testes_id\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
