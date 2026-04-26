-- =============================================
-- Migration: Adicionar campos completos à tabela vagas
-- =============================================

ALTER TABLE vagas ADD COLUMN modelo_trabalho TEXT;
ALTER TABLE vagas ADD COLUMN regime TEXT;
ALTER TABLE vagas ADD COLUMN salario NUMERIC(10,2);
ALTER TABLE vagas ADD COLUMN hard_skills TEXT[];
ALTER TABLE vagas ADD COLUMN idiomas JSONB;
ALTER TABLE vagas ADD COLUMN escolaridade_minima TEXT;
ALTER TABLE vagas ADD COLUMN departamento TEXT;
ALTER TABLE vagas ADD COLUMN data_limite DATE;
ALTER TABLE vagas ADD COLUMN quantidade_vagas INTEGER DEFAULT 1;
ALTER TABLE vagas ADD COLUMN beneficios TEXT[];
ALTER TABLE vagas ADD COLUMN diferenciais TEXT;
ALTER TABLE vagas ADD COLUMN perguntas_triagem JSONB;
ALTER TABLE vagas ADD COLUMN template_testes_id UUID REFERENCES templates_testes(id) ON DELETE SET NULL;
