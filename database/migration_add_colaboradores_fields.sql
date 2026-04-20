-- Migration: Add missing fields to colaboradores table
-- Run this script to update your database schema to match the application code.

ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS setor TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS role role_type NOT NULL DEFAULT 'colaborador';
