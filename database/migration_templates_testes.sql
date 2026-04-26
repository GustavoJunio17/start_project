-- =============================================
-- Migration: Adicionar suporte a Templates de Testes
-- =============================================

-- Tabela de templates de testes (coleções nomeadas de questões)
CREATE TABLE templates_testes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  questoes_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para buscar templates rápido por empresa
CREATE INDEX idx_templates_testes_empresa_id ON templates_testes(empresa_id);

-- Adicionar coluna template_testes_id na tabela vagas
ALTER TABLE vagas ADD COLUMN template_testes_id UUID REFERENCES templates_testes(id) ON DELETE SET NULL;

-- RLS Policies
ALTER TABLE templates_testes ENABLE ROW LEVEL SECURITY;

-- Empresa pode ver/criar/deletar apenas seus próprios templates
CREATE POLICY templates_testes_select ON templates_testes FOR SELECT
  USING (empresa_id = get_user_empresa_id());

CREATE POLICY templates_testes_insert ON templates_testes FOR INSERT
  WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY templates_testes_update ON templates_testes FOR UPDATE
  USING (empresa_id = get_user_empresa_id())
  WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY templates_testes_delete ON templates_testes FOR DELETE
  USING (empresa_id = get_user_empresa_id());
