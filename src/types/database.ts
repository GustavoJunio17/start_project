export type Role = 'super_admin' | 'super_gestor' | 'admin' | 'gestor_rh' | 'user_empresa' | 'colaborador' | 'candidato'

export type SegmentoEmpresa = 'Saude' | 'Varejo' | 'Digital' | 'Educacao' | 'Industria' | 'Servicos' | 'Outros'

export type StatusEmpresa = 'ativa' | 'inativa' | 'bloqueada'

export type StatusCandidatura = 'inscrito' | 'em_avaliacao' | 'entrevista_agendada' | 'aprovado' | 'reprovado' | 'contratado'

export type Classificacao = 'ouro' | 'prata' | 'bronze'

export type StatusColaborador = 'em_treinamento' | 'ativo' | 'desligado'

export type OrigemColaborador = 'contratacao_direta' | 'conversao_candidato' | 'importacao_planilha'

export type EscolaridadeColaborador = 'Medio' | 'Superior' | 'Pos-graduado'

export type ModeloTrabalhoCola = 'remoto' | 'hibrido' | 'presencial'

export type RegimeContratoColaborador = 'CLT' | 'PJ' | 'Estagio' | 'Freelance'

export type NivelColaborador = 'Junior' | 'Pleno' | 'Senior' | 'Specialist'

export type TipoTeste = 'disc' | 'logica' | 'vendas' | 'atendimento'

export type TipoFeedback = 'interno_colaborador' | 'externo_candidato'

export type StatusAgendamento = 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'remarcado'

export type TipoAgendamento = 'online' | 'presencial'

export type StatusVaga = 'rascunho' | 'aberta' | 'pausada' | 'encerrada'

export type ModeloTrabalho = 'remoto' | 'hibrido' | 'presencial'

export type RegimeContrato = 'CLT' | 'PJ' | 'Estagio' | 'Freelance'

export type EscolaridadeMinima = 'EnsinioMedio' | 'Superior' | 'Pos'

export type Tema = 'dark' | 'clean' | 'auto'

export type PlanoEmpresa = 'starter' | 'profissional' | 'enterprise'

export type TipoAlerta = 'candidato_score_baixo' | 'teste_pendente' | 'feedback_atrasado' | 'reavaliacao_vencida'

export interface PerfilDISC {
  D: number
  I: number
  S: number
  C: number
}

export interface Permissoes {
  [pagina: string]: {
    ver: boolean
    criar: boolean
    editar: boolean
    excluir: boolean
    convidar: boolean
  }
}

export interface User {
  id: string
  email: string
  nome_completo: string
  role: Role
  empresa_id: string | null
  empresa_nome: string | null
  permissoes: Permissoes | null
  avatar_url: string | null
  telefone: string | null
  tema_preferido: Tema
  ativo: boolean
  criado_por: string | null
  created_at: string
  updated_at: string
  ultimo_login: string | null
}

export interface Empresa {
  id: string
  nome: string
  segmento: SegmentoEmpresa
  categoria: string | null
  cnpj: string | null
  email_contato: string | null
  telefone: string | null
  logo_url: string | null
  status: StatusEmpresa
  tema_padrao: Tema
  plano: PlanoEmpresa
  configuracoes: Record<string, unknown> | null
  data_cadastro: string
  criado_por: string | null
}

export interface TemplateTeste {
  id: string
  empresa_id: string
  nome: string
  descricao: string | null
  questoes_ids: string[]
  created_at: string
}

export interface Vaga {
  id: string
  empresa_id: string
  titulo: string
  descricao: string | null
  requisitos: string | null
  categoria: string | null
  perfil_disc_ideal: PerfilDISC | null
  status: StatusVaga
  template_testes_id?: string | null
  criado_por: string | null
  created_at: string
  modelo_trabalho?: ModeloTrabalho | null
  regime?: RegimeContrato | null
  salario?: number | null
  hard_skills?: string[] | null
  idiomas?: { idioma: string; nivel: string }[] | null
  escolaridade_minima?: EscolaridadeMinima | null
  departamento?: string | null
  data_limite?: string | null
  quantidade_vagas?: number | null
  beneficios?: string[] | null
  diferenciais?: string | null
  perguntas_triagem?: { pergunta: string; tipo: string }[] | null
  empresa?: Empresa
}

export interface Candidato {
  id: string
  user_id: string
  empresa_id: string
  vaga_id: string | null
  nome_completo: string
  whatsapp: string | null
  email: string
  cargo_pretendido: string | null
  curriculo_url: string | null
  documento_url: string | null
  foto_url: string | null
  status_candidatura: StatusCandidatura
  perfil_disc: PerfilDISC | null
  score_logica: number | null
  score_vendas: number | null
  match_score: number | null
  classificacao: Classificacao | null
  disponivel_banco_talentos: boolean
  data_ultimo_teste: string | null
  created_at: string
  vaga?: Vaga
  empresa?: Empresa
}

export interface Colaborador {
  id: string
  user_id: string | null
  empresa_id: string
  nome: string
  cargo: string | null
  email: string | null
  telefone?: string | null
  cpf?: string | null
  departamento?: string | null
  data_contratacao: string | null
  modelo_trabalho?: ModeloTrabalhoCola | null
  regime_contrato?: RegimeContratoColaborador | null
  nivel?: NivelColaborador | null
  salario?: number | null
  hard_skills?: string[] | null
  escolaridade?: EscolaridadeColaborador | null
  origem: OrigemColaborador
  status: StatusColaborador
  perfil_disc: PerfilDISC | null
  proxima_reavaliacao: string | null
  empresa?: Empresa
}

export interface QuestaoDisc {
  id: string
  empresa_id: string | null
  vaga_id: string | null
  pergunta: string
  opcoes: { texto: string; dimensao: 'D' | 'I' | 'S' | 'C' }[]
}

export interface RespostaTeste {
  id: string
  candidato_id: string
  tipo: TipoTeste
  respostas: Record<string, unknown>
  resultado: Record<string, unknown> | null
  score: number | null
  duracao_segundos: number | null
  created_at: string
}

export interface Feedback {
  id: string
  empresa_id: string
  colaborador_id: string | null
  candidato_id: string | null
  autor_id: string
  tipo: TipoFeedback
  parar: string | null
  comecar: string | null
  continuar: string | null
  acao: string | null
  visivel_para_candidato: boolean
  data_envio: string | null
  created_at: string
}

export interface Agendamento {
  id: string
  candidato_id: string
  empresa_id: string
  gestor_responsavel_id: string
  data_hora: string
  tipo: TipoAgendamento
  link_reuniao: string | null
  endereco: string | null
  status: StatusAgendamento
  observacoes: string | null
  resultado: string | null
  created_at: string
  candidato?: Candidato
}

export interface PDI {
  id: string
  colaborador_id: string
  empresa_id: string
  objetivos: Record<string, unknown>
  prazo: string | null
  status: string
  acompanhamento: Record<string, unknown> | null
  created_at: string
}

export interface Onboarding {
  id: string
  colaborador_id: string
  empresa_id: string
  etapas: { titulo: string; concluida: boolean; data: string | null }[]
  percentual_concluido: number
  created_at: string
}

export interface TreinamentoIA {
  id: string
  colaborador_id: string
  empresa_id: string
  cargo: string | null
  conteudo_gerado: string | null
  gerado_por_ia: boolean
  status: 'pendente' | 'em_andamento' | 'concluido'
  created_at: string
}

export interface NotificacaoVaga {
  id: string
  candidato_id: string
  vaga_id: string
  empresa_id: string
  motivo_match: string | null
  visualizada: boolean
  created_at: string
  vaga?: Vaga
}

export interface AlertaAutomatico {
  id: string
  empresa_id: string
  tipo: TipoAlerta
  destinatario_id: string
  mensagem: string | null
  lido: boolean
  created_at: string
}

export interface Convite {
  id: string
  email: string
  role: Role
  empresa_id: string | null
  token: string
  expira_em: string
  usado: boolean
  criado_por: string
  created_at: string
}

export interface Candidatura {
  id: string
  vaga_id: string
  nome: string
  email: string
  telefone: string
  linkedin: string | null
  pretensao_salarial: string | null
  mensagem: string | null
  curriculo: Buffer | null
  curriculo_nome: string | null
  status: 'pendente' | 'lido' | 'rejeito' | 'contratado'
  created_at: string
  updated_at: string
  vaga?: Vaga
}
