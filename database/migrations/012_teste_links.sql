-- Create teste_links table for public test access tokens
CREATE TABLE IF NOT EXISTS teste_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidatura_id UUID NOT NULL REFERENCES candidaturas(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  respondido BOOLEAN NOT NULL DEFAULT false,
  resultado JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE INDEX IF NOT EXISTS idx_teste_links_token ON teste_links(token);
CREATE INDEX IF NOT EXISTS idx_teste_links_candidatura_id ON teste_links(candidatura_id);
