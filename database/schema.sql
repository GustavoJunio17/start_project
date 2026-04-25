-- =============================================
-- START PRO 5.0 — Schema Completo
-- =============================================

-- Enums
CREATE TYPE role_type AS ENUM ('super_admin', 'super_gestor', 'admin', 'gestor_rh', 'colaborador', 'candidato');
CREATE TYPE segmento_empresa AS ENUM ('Saude', 'Varejo', 'Digital', 'Educacao', 'Industria', 'Servicos', 'Outros');
CREATE TYPE status_empresa AS ENUM ('ativa', 'inativa', 'bloqueada');
CREATE TYPE status_candidatura AS ENUM ('inscrito', 'em_avaliacao', 'entrevista_agendada', 'aprovado', 'reprovado', 'contratado');
CREATE TYPE classificacao_type AS ENUM ('ouro', 'prata', 'bronze');
CREATE TYPE status_colaborador AS ENUM ('em_treinamento', 'ativo', 'desligado');
CREATE TYPE origem_colaborador AS ENUM ('contratacao_direta', 'conversao_candidato', 'importacao_planilha');
CREATE TYPE tipo_teste AS ENUM ('disc', 'logica', 'vendas', 'atendimento');
CREATE TYPE tipo_feedback AS ENUM ('interno_colaborador', 'externo_candidato');
CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'remarcado');
CREATE TYPE tipo_agendamento AS ENUM ('online', 'presencial');
CREATE TYPE status_vaga AS ENUM ('rascunho', 'aberta', 'pausada', 'encerrada');
CREATE TYPE tema_type AS ENUM ('dark', 'clean', 'auto');
CREATE TYPE tipo_alerta AS ENUM ('candidato_score_baixo', 'teste_pendente', 'feedback_atrasado', 'reavaliacao_vencida');
CREATE TYPE plano_empresa AS ENUM ('starter', 'profissional', 'enterprise');

-- =============================================
-- TABELAS
-- =============================================

CREATE TABLE empresas (
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
  plano plano_empresa NOT NULL DEFAULT 'starter',
  configuracoes JSONB DEFAULT '{}',
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE, -- links to auth.users.id
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
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

ALTER TABLE empresas ADD CONSTRAINT fk_empresas_criado_por FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE vagas (
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

CREATE TABLE candidatos (
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

CREATE TABLE colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  data_nascimento DATE,
  setor TEXT,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  role role_type NOT NULL DEFAULT 'colaborador',
  data_contratacao DATE,
  origem origem_colaborador NOT NULL DEFAULT 'contratacao_direta',
  status status_colaborador NOT NULL DEFAULT 'em_treinamento',
  perfil_disc JSONB,
  proxima_reavaliacao DATE
);

CREATE TABLE questoes_disc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES vagas(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL
);

CREATE TABLE respostas_teste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  tipo tipo_teste NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}',
  resultado JSONB,
  score INTEGER,
  duracao_segundos INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feedbacks (
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

CREATE TABLE agendamentos (
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

CREATE TABLE pdis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  objetivos JSONB NOT NULL DEFAULT '[]',
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  acompanhamento JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  etapas JSONB NOT NULL DEFAULT '[]',
  percentual_concluido INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE treinamentos_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cargo TEXT,
  conteudo_gerado TEXT,
  gerado_por_ia BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notificacoes_vaga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  motivo_match TEXT,
  visualizada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alertas_automaticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo tipo_alerta NOT NULL,
  destinatario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mensagem TEXT,
  lido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE convites (
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

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_empresa_id ON users(empresa_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_candidatos_empresa_id ON candidatos(empresa_id);
CREATE INDEX idx_candidatos_vaga_id ON candidatos(vaga_id);
CREATE INDEX idx_candidatos_user_id ON candidatos(user_id);
CREATE INDEX idx_colaboradores_empresa_id ON colaboradores(empresa_id);
CREATE INDEX idx_vagas_empresa_id ON vagas(empresa_id);
CREATE INDEX idx_feedbacks_empresa_id ON feedbacks(empresa_id);
CREATE INDEX idx_agendamentos_empresa_id ON agendamentos(empresa_id);
CREATE INDEX idx_convites_token ON convites(token);
CREATE INDEX idx_convites_email ON convites(email);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes_disc ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_teste ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdis ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamentos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_vaga ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_automaticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role and empresa_id
CREATE OR REPLACE FUNCTION get_user_role() RETURNS role_type AS $$
  SELECT role FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_empresa_id() RETURNS UUID AS $$
  SELECT empresa_id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_id() RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY users_select ON users FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR id = get_user_id()
  OR (empresa_id IS NOT NULL AND empresa_id = get_user_empresa_id())
);

CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor', 'empresa')
  OR auth.uid() IS NOT NULL -- self-registration
);

CREATE POLICY users_update ON users FOR UPDATE USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR id = get_user_id()
  OR (get_user_role() IN ('admin', 'gestor_rh') AND empresa_id = get_user_empresa_id())
);

-- EMPRESAS policies
CREATE POLICY empresas_select ON empresas FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR id = get_user_empresa_id()
);

CREATE POLICY empresas_insert ON empresas FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
);

CREATE POLICY empresas_update ON empresas FOR UPDATE USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR id = get_user_empresa_id()
);

CREATE POLICY empresas_delete ON empresas FOR DELETE USING (
  get_user_role() = 'super_admin'
);

-- VAGAS policies
CREATE POLICY vagas_select ON vagas FOR SELECT USING (
  publica = true
  OR get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY vagas_insert ON vagas FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY vagas_update ON vagas FOR UPDATE USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY vagas_delete ON vagas FOR DELETE USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- CANDIDATOS policies
CREATE POLICY candidatos_select ON candidatos FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR user_id = get_user_id()
);

CREATE POLICY candidatos_insert ON candidatos FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR user_id = get_user_id()
);

CREATE POLICY candidatos_update ON candidatos FOR UPDATE USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR user_id = get_user_id()
);

-- COLABORADORES policies
CREATE POLICY colaboradores_select ON colaboradores FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY colaboradores_insert ON colaboradores FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY colaboradores_update ON colaboradores FOR UPDATE USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- QUESTOES DISC policies
CREATE POLICY questoes_disc_select ON questoes_disc FOR SELECT USING (
  empresa_id IS NULL -- global questions
  OR get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY questoes_disc_insert ON questoes_disc FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- RESPOSTAS TESTE policies
CREATE POLICY respostas_teste_select ON respostas_teste FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR candidato_id IN (SELECT id FROM candidatos WHERE empresa_id = get_user_empresa_id())
  OR candidato_id IN (SELECT id FROM candidatos WHERE user_id = get_user_id())
);

CREATE POLICY respostas_teste_insert ON respostas_teste FOR INSERT WITH CHECK (
  candidato_id IN (SELECT id FROM candidatos WHERE user_id = get_user_id())
  OR get_user_role() IN ('super_admin', 'super_gestor')
);

-- FEEDBACKS policies
CREATE POLICY feedbacks_select ON feedbacks FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR (candidato_id IN (SELECT id FROM candidatos WHERE user_id = get_user_id()) AND visivel_para_candidato = true)
);

CREATE POLICY feedbacks_insert ON feedbacks FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- AGENDAMENTOS policies
CREATE POLICY agendamentos_select ON agendamentos FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR candidato_id IN (SELECT id FROM candidatos WHERE user_id = get_user_id())
);

CREATE POLICY agendamentos_insert ON agendamentos FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- PDI policies
CREATE POLICY pdis_select ON pdis FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY pdis_insert ON pdis FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- ONBOARDING policies
CREATE POLICY onboardings_select ON onboardings FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY onboardings_insert ON onboardings FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- TREINAMENTOS IA policies
CREATE POLICY treinamentos_ia_select ON treinamentos_ia FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

CREATE POLICY treinamentos_ia_insert ON treinamentos_ia FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
);

-- NOTIFICACOES VAGA policies
CREATE POLICY notificacoes_vaga_select ON notificacoes_vaga FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR candidato_id IN (SELECT id FROM candidatos WHERE user_id = get_user_id())
);

-- ALERTAS policies
CREATE POLICY alertas_automaticos_select ON alertas_automaticos FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR destinatario_id = get_user_id()
);

-- CONVITES policies
CREATE POLICY convites_select ON convites FOR SELECT USING (
  get_user_role() IN ('super_admin', 'super_gestor')
  OR empresa_id = get_user_empresa_id()
  OR email = (SELECT email FROM users WHERE auth_id = auth.uid())
);

CREATE POLICY convites_insert ON convites FOR INSERT WITH CHECK (
  get_user_role() IN ('super_admin', 'super_gestor', 'admin', 'gestor_rh')
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, nome_completo, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::role_type, 'candidato')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Calculate match score
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

-- Classify candidate based on match score
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
