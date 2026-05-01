-- Add missing roles to role_type enum
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'gestor_rh' BEFORE 'colaborador';
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'admin' BEFORE 'colaborador';
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'super_gestor' AFTER 'super_admin';
