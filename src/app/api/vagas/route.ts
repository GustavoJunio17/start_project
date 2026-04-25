import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import { canManageVagas } from '@/lib/auth/permissions'
import pool from '@/lib/db/pool'

/**
 * GET /api/vagas
 * Listar vagas - qualquer pessoa autenticada pode ver vagas públicas
 * Admins/gestores_rh podem ver vagas da sua empresa
 * Super_admin e super_gestor podem ver todas as vagas
 */
async function handleGET(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  let query = 'SELECT * FROM vagas WHERE '
  const params: (string | boolean)[] = []

  // Super admins veem todas as vagas
  if (user.role === 'super_admin' || user.role === 'gestor_admin') {
    // Sem filtro, retorna todas
  } else if (user.role === 'user_empresa' || user.role === 'gestor_rh') {
    // Admins veem vagas da sua empresa (incluindo rascunhos)
    query += 'empresa_id = $1'
    params.push(user.empresa_id as string)
  } else {
    // Candidatos e colaboradores veem apenas vagas confirmadas (não rascunho)
    query += 'status != $1'
    params.push('rascunho')
  }

  query += ' ORDER BY created_at DESC'

  const result = await pool.query(query, params)
  return successResponse(result.rows)
}

/**
 * POST /api/vagas
 * Criar nova vaga - apenas admin, gestor_rh, super_admin ou super_gestor
 */
async function handlePOST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  if (!canManageVagas(user.role as any)) {
    return errorResponse('Voce nao tem permissao para criar vagas', 403)
  }

  const body = await req.json()
  const { titulo, descricao, requisitos, categoria, perfil_disc_ideal } = body

  if (!titulo) {
    return errorResponse('Titulo da vaga e obrigatorio', 400)
  }

  const empresaId = user.role === 'super_admin' || user.role === 'gestor_admin'
    ? body.empresa_id
    : user.empresa_id

  if (!empresaId) {
    return errorResponse('Empresa nao identificada', 400)
  }

  const query = `
    INSERT INTO vagas (empresa_id, titulo, descricao, requisitos, categoria, perfil_disc_ideal, status, criado_por)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `

  const result = await pool.query(query, [
    empresaId,
    titulo,
    descricao || null,
    requisitos || null,
    categoria || null,
    perfil_disc_ideal ? JSON.stringify(perfil_disc_ideal) : null,
    'rascunho',
    user.id,
  ])

  return successResponse(result.rows[0], 201)
}

export const GET = withErrorHandler(handleGET)
export const POST = withErrorHandler(handlePOST)
