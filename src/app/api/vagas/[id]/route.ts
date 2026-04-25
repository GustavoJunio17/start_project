import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import { canManageVagas } from '@/lib/auth/permissions'
import pool from '@/lib/db/pool'

/**
 * GET /api/vagas/[id]
 * Obter detalhes de uma vaga específica
 */
async function handleGET(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da vaga nao fornecido', 400)
  }

  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const { id } = params

  let query = 'SELECT * FROM vagas WHERE id = $1'
  const queryParams: string[] = [id]

  // Adicionar filtro de permissão se não for super admin/gestor
  if (user.role !== 'super_admin' && user.role !== 'gestor_admin') {
    query += ' AND ('
    if (user.role === 'user_empresa' || user.role === 'gestor_rh') {
      query += 'empresa_id = $2 OR status != $3'
      queryParams.push(user.empresa_id as string)
      queryParams.push('rascunho')
    } else {
      query += 'status != $2'
      queryParams.push('rascunho')
    }
    query += ')'
  }

  const result = await pool.query(query, queryParams)

  if (result.rows.length === 0) {
    return errorResponse('Vaga nao encontrada', 404)
  }

  return successResponse(result.rows[0])
}

/**
 * PUT /api/vagas/[id]
 * Atualizar vaga - apenas admin, gestor_rh, super_admin ou super_gestor da empresa
 */
async function handlePUT(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da vaga nao fornecido', 400)
  }

  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  if (!canManageVagas(user.role as any)) {
    return errorResponse('Voce nao tem permissao para atualizar vagas', 403)
  }

  const { id } = params
  const body = await req.json()

  // Verificar se a vaga existe e pertence à empresa do usuário
  const vagaResult = await pool.query('SELECT * FROM vagas WHERE id = $1', [id])
  if (vagaResult.rows.length === 0) {
    return errorResponse('Vaga nao encontrada', 404)
  }

  const vaga = vagaResult.rows[0]

  // Verificar permissão: só super_admin/gestor ou admin/gestor_rh da mesma empresa
  if (user.role !== 'super_admin' && user.role !== 'gestor_admin') {
    if (vaga.empresa_id !== user.empresa_id) {
      return errorResponse('Voce nao tem permissao para atualizar esta vaga', 403)
    }
  }

  // Edição só permitida em rascunho
  if (vaga.status !== 'rascunho') {
    return errorResponse('Vagas ja confirmadas nao podem ser editadas. Apenas desativadas', 403)
  }

  const { titulo, descricao, requisitos, categoria, perfil_disc_ideal, status } = body

  const updateQuery = `
    UPDATE vagas
    SET
      titulo = COALESCE($1, titulo),
      descricao = COALESCE($2, descricao),
      requisitos = COALESCE($3, requisitos),
      categoria = COALESCE($4, categoria),
      perfil_disc_ideal = COALESCE($5, perfil_disc_ideal)
    WHERE id = $6
    RETURNING *
  `

  const result = await pool.query(updateQuery, [
    titulo || null,
    descricao || null,
    requisitos || null,
    categoria || null,
    perfil_disc_ideal ? JSON.stringify(perfil_disc_ideal) : null,
    id,
  ])

  return successResponse(result.rows[0])
}

/**
 * DELETE /api/vagas/[id]
 * Deletar vaga - apenas admin, gestor_rh, super_admin ou super_gestor da empresa
 */
async function handleDELETE(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da vaga nao fornecido', 400)
  }

  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  if (!canManageVagas(user.role as any)) {
    return errorResponse('Voce nao tem permissao para deletar vagas', 403)
  }

  const { id } = params

  // Verificar se a vaga existe e pertence à empresa do usuário
  const vagaResult = await pool.query('SELECT * FROM vagas WHERE id = $1', [id])
  if (vagaResult.rows.length === 0) {
    return errorResponse('Vaga nao encontrada', 404)
  }

  const vaga = vagaResult.rows[0]

  // Verificar permissão
  if (user.role !== 'super_admin' && user.role !== 'gestor_admin') {
    if (vaga.empresa_id !== user.empresa_id) {
      return errorResponse('Voce nao tem permissao para deletar esta vaga', 403)
    }
  }

  // Deleção só permitida em rascunho
  if (vaga.status !== 'rascunho') {
    return errorResponse('Apenas vagas em rascunho podem ser deletadas', 403)
  }

  await pool.query('DELETE FROM vagas WHERE id = $1', [id])

  return successResponse({ message: 'Vaga deletada com sucesso' })
}

export const GET = withErrorHandler(handleGET)
export const PUT = withErrorHandler(handlePUT)
export const DELETE = withErrorHandler(handleDELETE)
