-- Allow teste_links to reference candidatos directly (not only candidaturas)
ALTER TABLE teste_links ALTER COLUMN candidatura_id DROP NOT NULL;

ALTER TABLE teste_links
  ADD COLUMN candidato_id UUID REFERENCES candidatos(id) ON DELETE CASCADE;

ALTER TABLE teste_links
  ADD CONSTRAINT chk_teste_links_has_subject
  CHECK (candidatura_id IS NOT NULL OR candidato_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_teste_links_candidato_id ON teste_links(candidato_id);
