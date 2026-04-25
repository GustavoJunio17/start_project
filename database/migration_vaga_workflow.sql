-- Migration: Update vaga status workflow
-- Adds 'rascunho' to status_vaga enum for draft workflow

-- Create new enum type with rascunho
CREATE TYPE status_vaga_new AS ENUM ('rascunho', 'aberta', 'pausada', 'encerrada');

-- Alter the column to use new type
ALTER TABLE vagas ALTER COLUMN status TYPE status_vaga_new USING status::text::status_vaga_new;

-- Drop old enum and rename new one
DROP TYPE status_vaga;
ALTER TYPE status_vaga_new RENAME TO status_vaga;

-- Set default to rascunho for new vagas
ALTER TABLE vagas ALTER COLUMN status SET DEFAULT 'rascunho';

-- Remove publica column (vagas públicas serão aquelas confirmadas/ativas)
ALTER TABLE vagas DROP COLUMN publica;
