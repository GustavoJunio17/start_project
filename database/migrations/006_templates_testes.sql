-- Create templates_testes table and link to vagas
CREATE TABLE IF NOT EXISTS templates_testes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  questoes_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_testes_empresa_id ON templates_testes(empresa_id);

ALTER TABLE vagas ADD COLUMN IF NOT EXISTS template_testes_id UUID REFERENCES templates_testes(id) ON DELETE SET NULL;
