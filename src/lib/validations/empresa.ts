/**
 * Validações para cadastro de empresa
 */

/**
 * Validar CNPJ (formato básico)
 * CNPJ deve ter 14 dígitos
 */
export function validarCNPJ(cnpj: string): boolean {
  // Remove caracteres especiais
  const cleaned = cnpj.replace(/\D/g, '')

  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) {
    return false
  }

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return false
  }

  // Calcula primeiro dígito verificador
  let sum = 0
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i]
  }

  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  // Calcula segundo dígito verificador
  sum = 0
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3]

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights2[i]
  }

  sum += digit1 * 2
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return parseInt(cleaned[12]) === digit1 && parseInt(cleaned[13]) === digit2
}

/**
 * Formatar CNPJ para exibição
 * 00.000.000/0000-00
 */
export function formatarCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
}

/**
 * Remover formatação de CNPJ
 */
export function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

/**
 * Validar email (formato básico)
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Validar senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 */
export function validarSenha(senha: string): {
  valida: boolean
  erros: string[]
} {
  const erros: string[] = []

  if (senha.length < 8) {
    erros.push('Senha deve ter no mínimo 8 caracteres')
  }

  if (!/[A-Z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos 1 letra maiúscula')
  }

  if (!/[a-z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos 1 letra minúscula')
  }

  if (!/\d/.test(senha)) {
    erros.push('Senha deve conter pelo menos 1 número')
  }

  return {
    valida: erros.length === 0,
    erros,
  }
}

/**
 * Validar nome da empresa
 */
export function validarNomeEmpresa(nome: string): boolean {
  const trimmed = nome.trim()
  return trimmed.length >= 3 && trimmed.length <= 100
}

/**
 * Gerar slug para empresa (URL amigável)
 * Exemplo: "Tech Solutions" -> "tech-solutions"
 */
export function gerarSlugEmpresa(nome: string): string {
  return nome
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens múltiplos
    .slice(0, 50) // Limita a 50 caracteres
}

/**
 * Validar área de atuação
 */
export const areasAtuacao = [
  'Saude',
  'Varejo',
  'Digital',
  'Educacao',
  'Industria',
  'Servicos',
  'Outros',
]

export function validarAreaAtuacao(area: string): boolean {
  return areasAtuacao.includes(area)
}

/**
 * Planos e seus limites
 */
export const planosInfo: Record<
  string,
  {
    nome: string
    descricao: string
    preco: number
    vagas_limite: number
    usuarios_limite: number
    features: string[]
  }
> = {
  starter: {
    nome: 'Starter',
    descricao: 'Para pequenas empresas começando com recrutamento',
    preco: 99,
    vagas_limite: 5,
    usuarios_limite: 2,
    features: [
      'Até 5 vagas abertas',
      'Até 2 usuários',
      'Testes básicos',
      'Suporte por email',
    ],
  },
  profissional: {
    nome: 'Profissional',
    descricao: 'Para empresas em crescimento',
    preco: 299,
    vagas_limite: 25,
    usuarios_limite: 10,
    features: [
      'Até 25 vagas abertas',
      'Até 10 usuários',
      'Todos os testes',
      'DISC, testes de raciocínio, vendas, atendimento',
      'Suporte prioritário',
      'Relatórios avançados',
    ],
  },
  enterprise: {
    nome: 'Enterprise',
    descricao: 'Para grandes corporações',
    preco: 0, // Verificar diretamente
    vagas_limite: 1000,
    usuarios_limite: 1000,
    features: [
      'Vagas ilimitadas',
      'Usuários ilimitados',
      'Todos os recursos',
      'Suporte 24/7',
      'Integração customizadas',
      'Consultoria de recrutamento',
      'Onboarding dedicated',
    ],
  },
}

export function validarPlano(plano: string): boolean {
  return ['starter', 'profissional', 'enterprise'].includes(plano)
}

/**
 * Mensagens de validação
 */
export const mensagensErro = {
  cnpj_invalido: 'CNPJ inválido',
  cnpj_duplicado: 'CNPJ já cadastrado no sistema',
  email_invalido: 'Email inválido',
  email_ja_existe: 'Email já cadastrado',
  senha_fraca: 'Senha não atende aos requisitos de segurança',
  nome_invalido: 'Nome da empresa deve ter entre 3 e 100 caracteres',
  area_invalida: 'Área de atuação inválida',
  plano_invalido: 'Plano inválido',
  empresa_nao_criada: 'Erro ao criar a empresa',
  usuario_nao_criado: 'Erro ao criar usuário admin da empresa',
}
