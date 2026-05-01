-- =============================================
-- START PRO — Schema Base PostgreSQL
-- =============================================

-- Enums
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('super_admin', 'gestor_admin', 'user_empresa', 'colaborador', 'candidato');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE segmento_empresa AS ENUM ('Saude', 'Varejo', 'Digital', 'Educacao', 'Industria', 'Servicos', 'Outros');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_empresa AS ENUM ('ativa', 'inativa', 'bloqueada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_candidatura AS ENUM ('inscrito', 'em_avaliacao', 'entrevista_agendada', 'aprovado', 'reprovado', 'contratado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE classificacao_type AS ENUM ('ouro', 'prata', 'bronze');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_colaborador AS ENUM ('em_treinamento', 'ativo', 'desligado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE origem_colaborador AS ENUM ('contratacao_direta', 'conversao_candidato', 'importacao_planilha');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_teste AS ENUM ('disc', 'logica', 'vendas', 'atendimento');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_feedback AS ENUM ('interno_colaborador', 'externo_candidato');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'remarcado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_agendamento AS ENUM ('online', 'presencial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_vaga AS ENUM ('rascunho', 'aberta', 'pausada', 'encerrada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tema_type AS ENUM ('dark', 'clean', 'auto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_alerta AS ENUM ('candidato_score_baixo', 'teste_pendente', 'feedback_atrasado', 'reavaliacao_vencida');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- TABELAS
-- =============================================

CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  segmento segmento_empresa NOT NULL DEFAULT 'Outros',
  categoria TEXT,
  cnpj TEXT,
  email_contato TEXT,
  telefone TEXT,
  logo_url TEXT,
  status status_empresa NOT NULL DEFAULT 'ativa',
  tema_padrao tema_type NOT NULL DEFAULT 'dark',
  configuracoes JSONB DEFAULT '{}',
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  role role_type NOT NULL DEFAULT 'candidato',
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  empresa_nome TEXT,
  permissoes JSONB DEFAULT '{}',
  avatar_url TEXT,
  telefone TEXT,
  tema_preferido tema_type NOT NULL DEFAULT 'dark',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_login TIMESTAMPTZ
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_empresas_criado_por'
  ) THEN
    ALTER TABLE empresas ADD CONSTRAINT fk_empresas_criado_por
      FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  requisitos TEXT,
  categoria TEXT,
  perfil_disc_ideal JSONB,
  status status_vaga NOT NULL DEFAULT 'rascunho',
  criado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES vagas(id) ON DELETE SET NULL,
  nome_completo TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  cargo_pretendido TEXT,
  curriculo_url TEXT,
  documento_url TEXT,
  foto_url TEXT,
  status_candidatura status_candidatura NOT NULL DEFAULT 'inscrito',
  perfil_disc JSONB,
  score_logica INTEGER,
  score_vendas INTEGER,
  match_score INTEGER,
  classificacao classificacao_type,
  disponivel_banco_talentos BOOLEAN NOT NULL DEFAULT true,
  data_ultimo_teste DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  data_contratacao DATE,
  origem origem_colaborador NOT NULL DEFAULT 'contratacao_direta',
  status status_colaborador NOT NULL DEFAULT 'em_treinamento',
  perfil_disc JSONB,
  proxima_reavaliacao DATE
);

CREATE TABLE IF NOT EXISTS questoes_disc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES vagas(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS respostas_teste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  tipo tipo_teste NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}',
  resultado JSONB,
  score INTEGER,
  duracao_segundos INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES candidatos(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo tipo_feedback NOT NULL,
  parar TEXT,
  comecar TEXT,
  continuar TEXT,
  acao TEXT,
  visivel_para_candidato BOOLEAN NOT NULL DEFAULT false,
  data_envio TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  gestor_responsavel_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  tipo tipo_agendamento NOT NULL DEFAULT 'online',
  link_reuniao TEXT,
  endereco TEXT,
  status status_agendamento NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  resultado TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pdis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  objetivos JSONB NOT NULL DEFAULT '[]',
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  acompanhamento JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  etapas JSONB NOT NULL DEFAULT '[]',
  percentual_concluido INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treinamentos_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cargo TEXT,
  conteudo_gerado TEXT,
  gerado_por_ia BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notificacoes_vaga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  motivo_match TEXT,
  visualizada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alertas_automaticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo tipo_alerta NOT NULL,
  destinatario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mensagem TEXT,
  lido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role role_type NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  usado BOOLEAN NOT NULL DEFAULT false,
  criado_por UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_empresa_id ON users(empresa_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_candidatos_empresa_id ON candidatos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_vaga_id ON candidatos(vaga_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_user_id ON candidatos(user_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_id ON colaboradores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_empresa_id ON feedbacks(empresa_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_empresa_id ON agendamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token);
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at'
  ) THEN
    CREATE TRIGGER users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION calcular_match_score(
  perfil_candidato JSONB,
  perfil_ideal JSONB
) RETURNS INTEGER AS $$
DECLARE
  diff_d NUMERIC;
  diff_i NUMERIC;
  diff_s NUMERIC;
  diff_c NUMERIC;
  score NUMERIC;
BEGIN
  IF perfil_candidato IS NULL OR perfil_ideal IS NULL THEN
    RETURN NULL;
  END IF;
  diff_d := ABS((perfil_candidato->>'D')::numeric - (perfil_ideal->>'D')::numeric);
  diff_i := ABS((perfil_candidato->>'I')::numeric - (perfil_ideal->>'I')::numeric);
  diff_s := ABS((perfil_candidato->>'S')::numeric - (perfil_ideal->>'S')::numeric);
  diff_c := ABS((perfil_candidato->>'C')::numeric - (perfil_ideal->>'C')::numeric);
  score := 100 - ((diff_d + diff_i + diff_s + diff_c) / 4);
  IF score < 0 THEN score := 0; END IF;
  RETURN ROUND(score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION classificar_candidato(score INTEGER)
RETURNS classificacao_type AS $$
BEGIN
  IF score >= 85 THEN RETURN 'ouro';
  ELSIF score >= 70 THEN RETURN 'prata';
  ELSIF score >= 50 THEN RETURN 'bronze';
  ELSE RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
