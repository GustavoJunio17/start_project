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
    console.log('🔄 Iniciando migração para adicionar campos de vagas...\n');

    // Criar enums
    console.log('📝 Criando enums...');
    try {
      await client.query(`CREATE TYPE modelo_trabalho AS ENUM ('remoto', 'hibrido', 'presencial')`);
      console.log('✅ modelo_trabalho criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  modelo_trabalho já existe');
      else throw e;
    }

    try {
      await client.query(`CREATE TYPE regime_contrato AS ENUM ('CLT', 'PJ', 'Estagio', 'Freelance')`);
      console.log('✅ regime_contrato criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  regime_contrato já existe');
      else throw e;
    }

    try {
      await client.query(`CREATE TYPE nivel_profissional AS ENUM ('Junior', 'Pleno', 'Senior', 'Specialist')`);
      console.log('✅ nivel_profissional criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  nivel_profissional já existe');
      else throw e;
    }

    try {
      await client.query(`CREATE TYPE escolaridade_minima AS ENUM ('EnsinioMedio', 'Superior', 'Pos')`);
      console.log('✅ escolaridade_minima criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  escolaridade_minima já existe');
      else throw e;
    }

    // Adicionar colunas na tabela vagas
    console.log('\n📝 Adicionando colunas na tabela vagas...');
    const columnsToAdd = [
      { name: 'modelo_trabalho', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS modelo_trabalho modelo_trabalho' },
      { name: 'regime', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS regime regime_contrato' },
      { name: 'nivel', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS nivel nivel_profissional' },
      { name: 'salario_minimo', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS salario_minimo NUMERIC(10, 2)' },
      { name: 'salario_maximo', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS salario_maximo NUMERIC(10, 2)' },
      { name: 'hard_skills', sql: "ALTER TABLE vagas ADD COLUMN IF NOT EXISTS hard_skills TEXT[] DEFAULT '{}'" },
      { name: 'idiomas', sql: "ALTER TABLE vagas ADD COLUMN IF NOT EXISTS idiomas JSONB DEFAULT '[]'" },
      { name: 'escolaridade_minima', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS escolaridade_minima escolaridade_minima' },
      { name: 'departamento', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS departamento TEXT' },
      { name: 'data_limite', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS data_limite DATE' },
      { name: 'quantidade_vagas', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS quantidade_vagas INTEGER DEFAULT 1' },
      { name: 'beneficios', sql: "ALTER TABLE vagas ADD COLUMN IF NOT EXISTS beneficios TEXT[] DEFAULT '{}'" },
      { name: 'diferenciais', sql: 'ALTER TABLE vagas ADD COLUMN IF NOT EXISTS diferenciais TEXT' },
      { name: 'perguntas_triagem', sql: "ALTER TABLE vagas ADD COLUMN IF NOT EXISTS perguntas_triagem JSONB DEFAULT '[]'" },
    ];

    for (const col of columnsToAdd) {
      try {
        await client.query(col.sql);
        console.log(`✅ ${col.name}`);
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log(`⏭️  ${col.name} já existe`);
        } else {
          throw e;
        }
      }
    }

    // Criar índices
    console.log('\n📊 Criando índices...');
    const indices = [
      { name: 'idx_vagas_modelo_trabalho', sql: 'CREATE INDEX IF NOT EXISTS idx_vagas_modelo_trabalho ON vagas(modelo_trabalho)' },
      { name: 'idx_vagas_regime', sql: 'CREATE INDEX IF NOT EXISTS idx_vagas_regime ON vagas(regime)' },
      { name: 'idx_vagas_nivel', sql: 'CREATE INDEX IF NOT EXISTS idx_vagas_nivel ON vagas(nivel)' },
      { name: 'idx_vagas_departamento', sql: 'CREATE INDEX IF NOT EXISTS idx_vagas_departamento ON vagas(departamento)' },
    ];

    for (const idx of indices) {
      await client.query(idx.sql);
      console.log(`✅ ${idx.name}`);
    }

    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
