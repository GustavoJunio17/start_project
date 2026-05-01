CREATE TABLE gestor_rh_setores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cargos_departamento_id UUID NOT NULL REFERENCES cargos_departamentos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, cargos_departamento_id)
);

CREATE INDEX idx_gestor_rh_setores_user_id ON gestor_rh_setores(user_id);
CREATE INDEX idx_gestor_rh_setores_empresa_id ON gestor_rh_setores(empresa_id);
