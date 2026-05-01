-- Migration: Align colaboradores table with TypeScript interface
-- Renames 'setor' to 'departamento' and adds missing columns

ALTER TABLE colaboradores RENAME COLUMN setor TO departamento;

ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS modelo_trabalho TEXT,
  ADD COLUMN IF NOT EXISTS regime_contrato TEXT,
  ADD COLUMN IF NOT EXISTS salario NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS nivel TEXT,
  ADD COLUMN IF NOT EXISTS escolaridade TEXT,
  ADD COLUMN IF NOT EXISTS hard_skills TEXT[];
