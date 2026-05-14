-- Migration: Suporte completo ao gerenciamento de candidatos (Pendentes/Aprovados/Rejeitados/Banco)
-- - Permite agendamentos e feedbacks vinculados a candidaturas (formulário público)
-- - Cria tabela observacoes_candidato (notas internas)
-- - Adiciona índices

-- 1. Agendamentos: aceitar candidatura_id como alternativa a candidato_id
ALTER TABLE agendamentos ALTER COLUMN candidato_id DROP NOT NULL;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS candidatura_id UUID
  REFERENCES candidaturas(id) ON DELETE CASCADE;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_target_check;
ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_target_check
  CHECK (candidato_id IS NOT NULL OR candidatura_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_agendamentos_candidatura_id ON agendamentos(candidatura_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_candidato_id ON agendamentos(candidato_id);

-- 2. Feedbacks: aceitar candidatura_id para enviar feedback ao candidato externo
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS candidatura_id UUID
  REFERENCES candidaturas(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_feedbacks_candidatura_id ON feedbacks(candidatura_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_candidato_id ON feedbacks(candidato_id);

-- 3. Tabela observacoes_candidato (notas internas, não visíveis ao candidato)
CREATE TABLE IF NOT EXISTS observacoes_candidato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidatura_id UUID REFERENCES candidaturas(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES candidatos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (candidato_id IS NOT NULL OR candidatura_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_observacoes_candidatura_id ON observacoes_candidato(candidatura_id);
CREATE INDEX IF NOT EXISTS idx_observacoes_candidato_id ON observacoes_candidato(candidato_id);
CREATE INDEX IF NOT EXISTS idx_observacoes_empresa_id ON observacoes_candidato(empresa_id);

-- 4. Habilidades/skills no candidato (string livre, simples para filtro)
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS skills TEXT;
