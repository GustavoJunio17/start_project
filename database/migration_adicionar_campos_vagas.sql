-- Migration: Adicionar campos de contrato, especificações técnicas e gestão interna

-- Criar enums
CREATE TYPE modelo_trabalho AS ENUM ('remoto', 'hibrido', 'presencial');
CREATE TYPE regime_contrato AS ENUM ('CLT', 'PJ', 'Estagio', 'Freelance');
CREATE TYPE nivel_profissional AS ENUM ('Junior', 'Pleno', 'Senior', 'Specialist');
CREATE TYPE escolaridade_minima AS ENUM ('EnsinioMedio', 'Superior', 'Pos');

-- Adicionar colunas na tabela vagas
ALTER TABLE vagas
ADD COLUMN modelo_trabalho modelo_trabalho,
ADD COLUMN regime regime_contrato,
ADD COLUMN nivel nivel_profissional,
ADD COLUMN salario_minimo NUMERIC(10, 2),
ADD COLUMN salario_maximo NUMERIC(10, 2),
ADD COLUMN hard_skills TEXT[] DEFAULT '{}',
ADD COLUMN idiomas JSONB DEFAULT '[]',
ADD COLUMN escolaridade_minima escolaridade_minima,
ADD COLUMN departamento TEXT,
ADD COLUMN data_limite DATE,
ADD COLUMN quantidade_vagas INTEGER DEFAULT 1,
ADD COLUMN beneficios TEXT[] DEFAULT '{}',
ADD COLUMN diferenciais TEXT,
ADD COLUMN perguntas_triagem JSONB DEFAULT '[]';

-- Adicionar índices para melhor performance
CREATE INDEX idx_vagas_modelo_trabalho ON vagas(modelo_trabalho);
CREATE INDEX idx_vagas_regime ON vagas(regime);
CREATE INDEX idx_vagas_nivel ON vagas(nivel);
CREATE INDEX idx_vagas_departamento ON vagas(departamento);
