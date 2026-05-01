-- Rename setor -> departamento if setor exists (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'colaboradores' AND column_name = 'setor'
  ) THEN
    ALTER TABLE colaboradores RENAME COLUMN setor TO departamento;
  END IF;
END $$;

-- Add all extended fields to colaboradores
ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS departamento TEXT,
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS role role_type DEFAULT 'colaborador',
  ADD COLUMN IF NOT EXISTS nivel TEXT,
  ADD COLUMN IF NOT EXISTS modelo_trabalho TEXT,
  ADD COLUMN IF NOT EXISTS regime_contrato TEXT,
  ADD COLUMN IF NOT EXISTS salario NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS hard_skills TEXT[],
  ADD COLUMN IF NOT EXISTS escolaridade TEXT;

CREATE INDEX IF NOT EXISTS idx_colaboradores_nivel ON colaboradores(nivel);
