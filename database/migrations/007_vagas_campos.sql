-- Add extended fields to vagas
ALTER TABLE vagas
  ADD COLUMN IF NOT EXISTS cargo TEXT,
  ADD COLUMN IF NOT EXISTS modelo_trabalho TEXT,
  ADD COLUMN IF NOT EXISTS regime TEXT,
  ADD COLUMN IF NOT EXISTS salario NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS hard_skills TEXT[],
  ADD COLUMN IF NOT EXISTS idiomas JSONB,
  ADD COLUMN IF NOT EXISTS escolaridade_minima TEXT,
  ADD COLUMN IF NOT EXISTS departamento TEXT,
  ADD COLUMN IF NOT EXISTS data_limite DATE,
  ADD COLUMN IF NOT EXISTS quantidade_vagas INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS beneficios TEXT[],
  ADD COLUMN IF NOT EXISTS diferenciais TEXT,
  ADD COLUMN IF NOT EXISTS perguntas_triagem JSONB;

CREATE INDEX IF NOT EXISTS idx_vagas_modelo_trabalho ON vagas(modelo_trabalho);
CREATE INDEX IF NOT EXISTS idx_vagas_regime ON vagas(regime);
CREATE INDEX IF NOT EXISTS idx_vagas_departamento ON vagas(departamento);
