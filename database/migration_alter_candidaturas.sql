-- Alter candidaturas table to replace portfolio_url with pretensao_salarial
ALTER TABLE candidaturas DROP COLUMN IF EXISTS portfolio_url;
ALTER TABLE candidaturas ADD COLUMN IF NOT EXISTS pretensao_salarial TEXT;
