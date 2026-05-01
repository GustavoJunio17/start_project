-- Add plano field to empresas
DO $$ BEGIN
  CREATE TYPE plano_empresa AS ENUM ('starter', 'profissional', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS plano plano_empresa NOT NULL DEFAULT 'starter';
