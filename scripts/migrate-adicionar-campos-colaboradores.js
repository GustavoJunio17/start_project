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
    console.log('🔄 Iniciando migração para adicionar campos de colaboradores...\n');

    // Criar enums se não existirem
    console.log('📝 Criando enums...');
    try {
      await client.query(`CREATE TYPE modelo_trabalho_cola AS ENUM ('remoto', 'hibrido', 'presencial')`);
      console.log('✅ modelo_trabalho_cola criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  modelo_trabalho_cola já existe');
      else throw e;
    }

    try {
      await client.query(`CREATE TYPE regime_contrato_colaborador AS ENUM ('CLT', 'PJ', 'Estagio')`);
      console.log('✅ regime_contrato_colaborador criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  regime_contrato_colaborador já existe');
      else throw e;
    }

    try {
      await client.query(`CREATE TYPE nivel_colaborador AS ENUM ('Junior', 'Pleno', 'Senior')`);
      console.log('✅ nivel_colaborador criado');
    } catch (e) {
      if (e.code === '42710') console.log('⏭️  nivel_colaborador já existe');
      else throw e;
    }

    // Adicionar colunas na tabela colaboradores
    console.log('\n📝 Adicionando colunas na tabela colaboradores...');
    const columnsToAdd = [
      { name: 'telefone', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS telefone TEXT' },
      { name: 'cpf', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS cpf TEXT' },
      { name: 'departamento', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS departamento TEXT' },
      { name: 'modelo_trabalho', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS modelo_trabalho modelo_trabalho_cola' },
      { name: 'regime_contrato', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS regime_contrato regime_contrato_colaborador' },
      { name: 'salario', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS salario NUMERIC(10, 2)' },
      { name: 'hard_skills', sql: "ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS hard_skills TEXT[] DEFAULT '{}'" },
      { name: 'nivel', sql: 'ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS nivel nivel_colaborador' },
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
      { name: 'idx_colaboradores_departamento', sql: 'CREATE INDEX IF NOT EXISTS idx_colaboradores_departamento ON colaboradores(departamento)' },
      { name: 'idx_colaboradores_modelo_trabalho', sql: 'CREATE INDEX IF NOT EXISTS idx_colaboradores_modelo_trabalho ON colaboradores(modelo_trabalho)' },
      { name: 'idx_colaboradores_nivel', sql: 'CREATE INDEX IF NOT EXISTS idx_colaboradores_nivel ON colaboradores(nivel)' },
      { name: 'idx_colaboradores_cpf', sql: 'CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf ON colaboradores(cpf)' },
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
