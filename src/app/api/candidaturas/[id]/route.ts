import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import { canManageCandidatos } from '@/lib/auth/permissions'
import pool from '@/lib/db/pool'

/**
 * GET /api/candidaturas/[id]
 * Obter detalhes de uma candidatura específica
 */
async function handleGET(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da candidatura nao fornecido', 400)
  }
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const { id } = params

  let query = 'SELECT c.*, v.titulo as vaga_titulo FROM candidatos c LEFT JOIN vagas v ON c.vaga_id = v.id WHERE c.id = $1'
  const queryParams: string[] = [id]

  // Adicionar filtro de permissão
  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    if (user.role === 'admin' || user.role === 'gestor_rh') {
      query += ' AND c.empresa_id = $2'
      queryParams.push(user.empresa_id as string)
    } else if (user.role === 'candidato') {
      query += ' AND c.user_id = $2'
      queryParams.push(user.id)
    } else {
      return errorResponse('Voce nao tem permissao para acessar esta candidatura', 403)
    }
  }

  const result = await pool.query(query, queryParams)

  if (result.rows.length === 0) {
    return errorResponse('Candidatura nao encontrada', 404)
  }

  return successResponse(result.rows[0])
}

/**
 * PUT /api/candidaturas/[id]
 * Atualizar candidatura - apenas admin/gestor_rh ou o próprio candidato
 */
async function handlePUT(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da candidatura nao fornecido', 400)
  }
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const { id } = params
  const body = await req.json()

  // Verificar se a candidatura existe
  const candidaturaResult = await pool.query('SELECT * FROM candidatos WHERE id = $1', [id])
  if (candidaturaResult.rows.length === 0) {
    return errorResponse('Candidatura nao encontrada', 404)
  }

  const candidatura = candidaturaResult.rows[0]

  // Verificar permissão
  const hasPermission = 
    user.role === 'super_admin' || 
    user.role === 'super_gestor' || 
    (user.role === 'admin' && candidatura.empresa_id === user.empresa_id) ||
    (user.role === 'gestor_rh' && candidatura.empresa_id === user.empresa_id) ||
    (user.role === 'candidato' && candidatura.user_id === user.id)

  if (!hasPermission) {
    return errorResponse('Voce nao tem permissao para atualizar esta candidatura', 403)
  }

  const { 
    status_candidatura, 
    perfil_disc, 
    score_logica, 
    score_vendas, 
    match_score, 
    classificacao,
    data_ultimo_teste,
    cargo_pretendido,
    curriculo_url,
    documento_url,
    foto_url
  } = body

  const updateQuery = `
    UPDATE candidatos 
    SET 
      status_candidatura = COALESCE($1, status_candidatura),
      perfil_disc = COALESCE($2, perfil_disc),
      score_logica = COALESCE($3, score_logica),
      score_vendas = COALESCE($4, score_vendas),
      match_score = COALESCE($5, match_score),
      classificacao = COALESCE($6, classificacao),
      data_ultimo_teste = COALESCE($7, data_ultimo_teste),
      cargo_pretendido = COALESCE($8, cargo_pretendido),
      curriculo_url = COALESCE($9, curriculo_url),
      documento_url = COALESCE($10, documento_url),
      foto_url = COALESCE($11, foto_url)
    WHERE id = $12
    RETURNING *
  `

  const result = await pool.query(updateQuery, [
    status_candidatura || null,
    perfil_disc ? JSON.stringify(perfil_disc) : null,
    score_logica !== undefined ? score_logica : null,
    score_vendas !== undefined ? score_vendas : null,
    match_score !== undefined ? match_score : null,
    classificacao || null,
    data_ultimo_teste || null,
    cargo_pretendido || null,
    curriculo_url || null,
    documento_url || null,
    foto_url || null,
    id,
  ])

  return successResponse(result.rows[0])
}

/**
 * DELETE /api/candidaturas/[id]
 * Deletar candidatura - apenas admin, gestor_rh ou o próprio candidato
 */
async function handleDELETE(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da candidatura nao fornecido', 400)
  }
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const { id } = params

  // Verificar se a candidatura existe
  const candidaturaResult = await pool.query('SELECT * FROM candidatos WHERE id = $1', [id])
  if (candidaturaResult.rows.length === 0) {
    return errorResponse('Candidatura nao encontrada', 404)
  }

  const candidatura = candidaturaResult.rows[0]

  // Verificar permissão
  const hasPermission = 
    user.role === 'super_admin' || 
    user.role === 'super_gestor' || 
    (user.role === 'admin' && candidatura.empresa_id === user.empresa_id) ||
    (user.role === 'gestor_rh' && candidatura.empresa_id === user.empresa_id) ||
    (user.role === 'candidato' && candidatura.user_id === user.id)

  if (!hasPermission) {
    return errorResponse('Voce nao tem permissao para deletar esta candidatura', 403)
  }

  await pool.query('DELETE FROM candidatos WHERE id = $1', [id])

  return successResponse({ message: 'Candidatura deletada com sucesso' })
}

export const GET = withErrorHandler(handleGET)
export const PUT = withErrorHandler(handlePUT)
export const DELETE = withErrorHandler(handleDELETE)
