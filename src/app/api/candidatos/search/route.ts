import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

/**
 * GET /api/candidatos/search
 * Buscar candidatos com filtros
 * Query params:
 * - status: status_candidatura (inscrito, em_avaliacao, entrevista_agendada, aprovado, reprovado, contratado)
 * - classificacao: classificacao (ouro, prata, bronze)
 * - vaga_id: filtrar por vaga
 * - empresa_id: filtrar por empresa (apenas para super_admin/super_gestor)
 * - match_score_min: score mínimo
 * - q: buscar por nome ou email
 */
async function handleGET(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const classificacao = searchParams.get('classificacao')
  const vagaId = searchParams.get('vaga_id')
  const empresaId = searchParams.get('empresa_id')
  const matchScoreMin = searchParams.get('match_score_min')
  const q = searchParams.get('q')

  let query = 'SELECT c.*, u.email as user_email, u.nome_completo as user_nome FROM candidatos c LEFT JOIN users u ON c.user_id = u.id WHERE '
  const params: (string | number)[] = []

  // Permissões
  if (user.role === 'super_admin' || user.role === 'super_gestor') {
    // Super admins veem todos - sem restrição
  } else if (user.role === 'user_empresa' || user.role === 'gestor_rh') {
    // Admins veem candidatos da sua empresa
    if (empresaId && empresaId !== user.empresa_id) {
      return errorResponse('Voce nao tem permissao para pesquisar candidatos desta empresa', 403)
    }
    query += `c.empresa_id = $${params.length + 1}`
    params.push(user.empresa_id as string)
  } else {
    // Outros roles não podem buscar
    return errorResponse('Voce nao tem permissao para buscar candidatos', 403)
  }

  // Filtros adicionais
  if (status) {
    query += ` AND c.status_candidatura = $${params.length + 1}`
    params.push(status)
  }

  if (classificacao) {
    query += ` AND c.classificacao = $${params.length + 1}`
    params.push(classificacao)
  }

  if (vagaId) {
    query += ` AND c.vaga_id = $${params.length + 1}`
    params.push(vagaId)
  }

  if (matchScoreMin) {
    query += ` AND c.match_score >= $${params.length + 1}`
    params.push(Number(matchScoreMin))
  }

  if (q) {
    query += ` AND (LOWER(c.nome_completo) LIKE LOWER($${params.length + 1}) OR LOWER(c.email) LIKE LOWER($${params.length + 2}))`
    params.push(`%${q}%`)
    params.push(`%${q}%`)
  }

  query += ' ORDER BY c.created_at DESC LIMIT 100'

  const result = await pool.query(query, params)
  return successResponse(result.rows)
}

export const GET = withErrorHandler(handleGET)
