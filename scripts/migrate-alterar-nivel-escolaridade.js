require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Alterando coluna nivel para escolaridade...\n');

    // Remover a coluna nivel se existir
    console.log('🗑️  Removendo coluna nivel...');
    await client.query('ALTER TABLE colaboradores DROP COLUMN IF EXISTS nivel');
    console.log('✅ Coluna nivel removida');

    // Remover o enum antigo
    console.log('🗑️  Removendo enum nivel_colaborador...');
    await client.query('DROP TYPE IF EXISTS nivel_colaborador');
    console.log('✅ Enum removido');

    // Criar novo enum para escolaridade
    console.log('📝 Criando enum escolaridade_colaborador...');
    try {
      await client.query(`CREATE TYPE escolaridade_colaborador AS ENUM ('Medio', 'Superior', 'Pos-graduado')`);
      console.log('✅ Enum escolaridade_colaborador criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  escolaridade_colaborador já existe');
      else throw e;
    }

    // Adicionar coluna escolaridade
    console.log('📝 Adicionando coluna escolaridade...');
    await client.query('ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS escolaridade escolaridade_colaborador');
    console.log('✅ Coluna escolaridade adicionada');

    // Criar índice
    console.log('📊 Criando índice...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_colaboradores_escolaridade ON colaboradores(escolaridade)');
    console.log('✅ Índice criado');

    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
