-- Link colaboradores back to their original candidato when hired via conversao_candidato
ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS candidato_id UUID REFERENCES candidatos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_colaboradores_candidato_id ON colaboradores(candidato_id);
