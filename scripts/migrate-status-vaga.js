require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

console.log('📋 Lendo variáveis de ambiente:');
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('');

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
    console.log('🔄 Iniciando migração...\n');

    // Verificar se 'rascunho' já existe no enum
    const checkEnum = await client.query(`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = 'status_vaga'::regtype
      AND enumlabel = 'rascunho'
    `);

    if (checkEnum.rows.length > 0) {
      console.log('✅ Status "rascunho" já existe no enum!');
      return;
    }

    console.log('📝 Adicionando "rascunho" ao enum status_vaga...');

    // Limpar tipo anterior se existir
    console.log('🧹 Limpando tipos antigos...');
    try {
      await client.query(`DROP TYPE IF EXISTS status_vaga_new`);
    } catch (e) {
      // Ignorar se não existir
    }
    console.log('✅ Cleanup feito');

    // Remover DEFAULT antes de converter
    console.log('🔧 Removendo DEFAULT da coluna...');
    await client.query(`ALTER TABLE vagas ALTER COLUMN status DROP DEFAULT`);
    console.log('✅ DEFAULT removido');

    // Criar novo enum com rascunho
    await client.query(`
      CREATE TYPE status_vaga_new AS ENUM ('rascunho', 'aberta', 'pausada', 'encerrada')
    `);
    console.log('✅ Novo enum criado');

    // Converter coluna para novo tipo
    console.log('🔄 Convertendo coluna status...');
    await client.query(`
      ALTER TABLE vagas ALTER COLUMN status TYPE status_vaga_new USING status::text::status_vaga_new
    `);
    console.log('✅ Coluna convertida');

    // Dropar enum antigo
    console.log('🗑️  Removendo enum antigo...');
    await client.query(`DROP TYPE status_vaga`);
    console.log('✅ Enum antigo removido');

    // Renomear novo enum
    console.log('📝 Renomeando novo enum...');
    await client.query(`ALTER TYPE status_vaga_new RENAME TO status_vaga`);
    console.log('✅ Enum renomeado');

    // Atualizar default
    console.log('⚙️  Atualizando valor padrão...');
    await client.query(`
      ALTER TABLE vagas ALTER COLUMN status SET DEFAULT 'rascunho'
    `);
    console.log('✅ Valor padrão atualizado\n');

    console.log('🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
