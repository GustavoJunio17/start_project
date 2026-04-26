require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedTemplates() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando seed de templates DISC padrões...\n');

    // Ler a migração
    const seedPath = path.join(__dirname, '../database/migration_seed_disc_templates.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    await client.query(sql);

    console.log('✅ Seed de templates DISC concluído com sucesso!\n');
    console.log('📊 Templates criados:');
    console.log('   1️⃣  DISC Rápido - 10 questões (triagem inicial)');
    console.log('   2️⃣  DISC Padrão - 16 questões (seleção)');
    console.log('   3️⃣  DISC Completo - 20 questões (análise aprofundada)\n');

  } catch (error) {
    console.error('❌ Erro no seed:', error.message);
    console.error('\nDetalhes do erro:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedTemplates();
