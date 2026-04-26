-- =============================================
-- Migration: Adicionar campo 'nivel' em colaboradores
-- =============================================

-- Adicionar coluna 'nivel' na tabela colaboradores
ALTER TABLE colaboradores ADD COLUMN nivel VARCHAR(20);

-- Index para facilitar buscas
CREATE INDEX idx_colaboradores_nivel ON colaboradores(nivel);
