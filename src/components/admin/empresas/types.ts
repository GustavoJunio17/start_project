export interface Empresa {
  id: string
  nome: string
  cnpj: string
  segmento: string
  email_contato: string | null
  status: 'ativa' | 'inativa' | 'bloqueada' | 'trial'
  plano: 'free' | 'starter' | 'profissional' | 'enterprise'
  data_cadastro: string
  total_usuarios: number
  total_vagas: number
  total_candidatos: number
  data_ultima_atividade?: string
}

export interface Stats {
  total: number
  ativas: number
  trial: number
  receita_estimada: number
}

export interface Filters {
  search: string
  status: string
  plano: string
  segmento: string
}
