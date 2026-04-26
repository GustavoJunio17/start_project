-- =============================================
-- Migration: Adicionar suporte a testes de colaboradores
-- =============================================

-- Tornar candidato_id nullable (alguns testes podem ser só de colaboradores)
ALTER TABLE respostas_teste ALTER COLUMN candidato_id DROP NOT NULL;

-- Adicionar coluna colaborador_id
ALTER TABLE respostas_teste ADD COLUMN colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE;

-- Adicionar constraint: pelo menos um dos dois deve estar preenchido
ALTER TABLE respostas_teste ADD CONSTRAINT chk_candidato_ou_colaborador
  CHECK ((candidato_id IS NOT NULL) OR (colaborador_id IS NOT NULL));

-- Index para buscar respostas de colaborador
CREATE INDEX idx_respostas_teste_colaborador_id ON respostas_teste(colaborador_id);
