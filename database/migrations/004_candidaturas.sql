-- Create candidaturas table for public job applications
CREATE TABLE IF NOT EXISTS candidaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  linkedin TEXT,
  portfolio_url TEXT,
  mensagem TEXT,
  curriculo BYTEA,
  curriculo_nome TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidaturas_vaga_id ON candidaturas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_email ON candidaturas(email);
