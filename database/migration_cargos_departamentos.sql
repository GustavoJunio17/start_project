-- Create table for departments and positions
CREATE TABLE cargos_departamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cargo', 'departamento')),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, tipo, nome)
);

CREATE INDEX idx_cargos_departamentos_empresa_id ON cargos_departamentos(empresa_id);
CREATE INDEX idx_cargos_departamentos_tipo ON cargos_departamentos(tipo);

ALTER TABLE cargos_departamentos ENABLE ROW LEVEL SECURITY;
