-- Add colaborador support to respostas_teste
ALTER TABLE respostas_teste ALTER COLUMN candidato_id DROP NOT NULL;

ALTER TABLE respostas_teste ADD COLUMN IF NOT EXISTS colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_candidato_ou_colaborador'
  ) THEN
    ALTER TABLE respostas_teste ADD CONSTRAINT chk_candidato_ou_colaborador
      CHECK ((candidato_id IS NOT NULL) OR (colaborador_id IS NOT NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_respostas_teste_colaborador_id ON respostas_teste(colaborador_id);
