-- Link cargos to their parent departamento
ALTER TABLE cargos_departamentos
  ADD COLUMN IF NOT EXISTS departamento_id UUID REFERENCES cargos_departamentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cargos_departamentos_departamento_id ON cargos_departamentos(departamento_id);
