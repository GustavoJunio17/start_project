-- =============================================
-- SCRIPT DE RESET: Drop e Recria o Banco
-- =============================================
-- Execute isso quando precisar resetar o banco para a estrutura mais recente

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Agora execute o init.sql para recriar tudo do zero:
-- \i database/init.sql
