CREATE TABLE IF NOT EXISTS colaborador_teste_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  respondido BOOLEAN NOT NULL DEFAULT false,
  resultado JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE INDEX IF NOT EXISTS idx_colab_teste_links_token ON colaborador_teste_links(token);
CREATE INDEX IF NOT EXISTS idx_colab_teste_links_colaborador ON colaborador_teste_links(colaborador_id);
