/**
 * Exemplos de uso das APIs de Vagas e Candidaturas
 * 
 * Use este arquivo como referência para integrar as APIs em seus componentes
 */

import React from 'react'

// ============================================
// EXEMPLOS DE USO
// ============================================

/**
 * 1. LISTAR VAGAS
 */
export async function listarVagas() {
  const response = await fetch('/api/vagas')
  const { success, data, error } = await response.json()

  if (!success) {
    console.error('Erro ao listar vagas:', error)
    return []
  }

  return data
}

/**
 * 2. CRIAR VAGA (Admin/Gestor RH)
 */
export async function criarVaga(novaVaga: {
  titulo: string
  descricao?: string
  requisitos?: string
  categoria?: string
  perfil_disc_ideal?: { D: number; I: number; S: number; C: number }
  empresa_id?: string
}) {
  const response = await fetch('/api/vagas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaVaga),
  })

  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao criar vaga')
  }

  return data
}

/**
 * 3. OBTER DETALHES DE UMA VAGA
 */
export async function obterVaga(vagaId: string) {
  const response = await fetch(`/api/vagas/${vagaId}`)
  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Vaga não encontrada')
  }

  return data
}

/**
 * 4. ATUALIZAR VAGA
 */
export async function atualizarVaga(
  vagaId: string,
  atualizacoes: Partial<{
    titulo: string
    descricao: string
    requisitos: string
  }>,
) {
  const response = await fetch(`/api/vagas/${vagaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(atualizacoes),
  })

  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao atualizar vaga')
  }

  return data
}

/**
 * 5. DELETAR VAGA
 */
export async function deletarVaga(vagaId: string) {
  const response = await fetch(`/api/vagas/${vagaId}`, {
    method: 'DELETE',
  })

  const { success, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao deletar vaga')
  }
}

/**
 * 6. LISTAR CANDIDATOS DE UMA VAGA
 */
export async function listarCandidatosVaga(vagaId: string) {
  const response = await fetch(`/api/vagas/${vagaId}/candidatos`)
  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao listar candidatos')
  }

  return data
}

/**
 * 7. LISTAR VAGAS DE UMA EMPRESA
 */
export async function listarVagasEmpresa(empresaId: string) {
  const response = await fetch(`/api/empresas/${empresaId}/vagas`)
  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao listar vagas da empresa')
  }

  return data
}

/**
 * 8. CANDIDATO SE INSCREVE EM UMA VAGA
 */
export async function inscreverVaga(candidatura: {
  vaga_id: string
  nome_completo?: string
  email: string
  whatsapp?: string
  cargo_pretendido?: string
  curriculo_url?: string
  documento_url?: string
  foto_url?: string
}) {
  const response = await fetch('/api/candidaturas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidatura),
  })

  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao inscrever em vaga')
  }

  return data
}

/**
 * 9. LISTAR CANDIDATURAS
 */
export async function listarCandidaturas() {
  const response = await fetch('/api/candidaturas')
  const { success, data, error } = await response.json()

  if (!success) {
    console.error('Erro ao listar candidaturas:', error)
    return []
  }

  return data
}

/**
 * 10. OBTER DETALHES DE UMA CANDIDATURA
 */
export async function obterCandidatura(candidaturaId: string) {
  const response = await fetch(`/api/candidaturas/${candidaturaId}`)
  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Candidatura não encontrada')
  }

  return data
}

/**
 * 11. ATUALIZAR CANDIDATURA (Status, scores, etc)
 */
export async function atualizarCandidatura(
  candidaturaId: string,
  atualizacoes: Partial<{
    status_candidatura: 'inscrito' | 'em_avaliacao' | 'entrevista_agendada' | 'aprovado' | 'reprovado' | 'contratado'
    perfil_disc: { D: number; I: number; S: number; C: number }
    score_logica: number
    score_vendas: number
    match_score: number
    classificacao: 'ouro' | 'prata' | 'bronze'
  }>,
) {
  const response = await fetch(`/api/candidaturas/${candidaturaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(atualizacoes),
  })

  const { success, data, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao atualizar candidatura')
  }

  return data
}

/**
 * 12. DELETAR CANDIDATURA
 */
export async function deletarCandidatura(candidaturaId: string) {
  const response = await fetch(`/api/candidaturas/${candidaturaId}`, {
    method: 'DELETE',
  })

  const { success, error } = await response.json()

  if (!success) {
    throw new Error(error || 'Erro ao deletar candidatura')
  }
}

/**
 * 13. PESQUISAR CANDIDATOS COM FILTROS
 */
export async function pesquisarCandidatos(filtros: {
  status?: 'inscrito' | 'em_avaliacao' | 'entrevista_agendada' | 'aprovado' | 'reprovado' | 'contratado'
  classificacao?: 'ouro' | 'prata' | 'bronze'
  vaga_id?: string
  match_score_min?: number
  q?: string // buscar por nome ou email
}) {
  const params = new URLSearchParams()

  if (filtros.status) params.append('status', filtros.status)
  if (filtros.classificacao) params.append('classificacao', filtros.classificacao)
  if (filtros.vaga_id) params.append('vaga_id', filtros.vaga_id)
  if (filtros.match_score_min) params.append('match_score_min', String(filtros.match_score_min))
  if (filtros.q) params.append('q', filtros.q)

  const response = await fetch(`/api/candidatos/search?${params.toString()}`)
  const { success, data, error } = await response.json()

  if (!success) {
    console.error('Erro ao pesquisar candidatos:', error)
    return []
  }

  return data
}

// ============================================
// EXEMPLOS DE USO EM COMPONENTES REACT
// ============================================

/**
 * Hook para listar vagas
 */
export function useVagas() {
  const [vagas, setVagas] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    listarVagas()
      .then(setVagas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { vagas, loading, error }
}
