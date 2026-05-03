import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import { canManageCandidatos } from '@/lib/auth/permissions'
import pool from '@/lib/db/pool'

/**
 * GET /api/candidaturas
 * Listar candidaturas
 * - Admin/gestor_rh veem candidaturas da sua empresa
 * - Super_admin/super_gestor veem todas
 * - Candidatos veem suas próprias candidaturas
 */
async function handleGET(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  let query = 'SELECT c.*, v.titulo as vaga_titulo FROM candidatos c LEFT JOIN vagas v ON c.vaga_id = v.id WHERE '
  const params: string[] = []

  if (user.role === 'super_admin' || user.role === 'super_gestor') {
    // Super admins veem todos
    query = query.slice(0, -6) // remove "WHERE"
  } else if (user.role === 'admin' || user.role === 'gestor_rh') {
    // Admins veem candidatos da sua empresa
    query += 'c.empresa_id = $1'
    params.push(user.empresa_id as string)
  } else if (user.role === 'candidato') {
    // Candidatos veem suas próprias candidaturas
    query += 'c.user_id = $1'
    params.push(user.id)
  } else {
    // Colaboradores não veem nada
    return errorResponse('Voce nao tem permissao para listar candidaturas', 403)
  }

  query += ' ORDER BY c.created_at DESC'

  const result = await pool.query(query, params)
  return successResponse(result.rows)
}

/**
 * POST /api/candidaturas
 * Criar nova candidatura (candidato se inscrevendo em uma vaga)
 */
async function handlePOST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const body = await req.json()
  const { vaga_id, empresa_id, nome_completo, email, whatsapp, cargo_pretendido, curriculo_url, documento_url, foto_url } = body

  if (!vaga_id) {
    return errorResponse('vaga_id e obrigatorio', 400)
  }

  if (!email) {
    return errorResponse('email e obrigatorio', 400)
  }

  // Verificar se a vaga existe
  const vagaResult = await pool.query('SELECT * FROM vagas WHERE id = $1', [vaga_id])
  if (vagaResult.rows.length === 0) {
    return errorResponse('Vaga nao encontrada', 404)
  }

  const vaga = vagaResult.rows[0]
  const finalEmpresaId = empresa_id || vaga.empresa_id

  // Verificar se já existe candidatura para esta vaga
  const existingResult = await pool.query(
    'SELECT * FROM candidatos WHERE user_id = $1 AND vaga_id = $2',
    [user.id, vaga_id]
  )

  if (existingResult.rows.length > 0) {
    return errorResponse('Voce ja se inscreveu nesta vaga', 400)
  }

  const query = `
    INSERT INTO candidatos (
      user_id, 
      empresa_id, 
      vaga_id, 
      nome_completo, 
      email, 
      whatsapp, 
      cargo_pretendido, 
      curriculo_url, 
      documento_url, 
      foto_url,
      status_candidatura
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'inscrito')
    RETURNING *
  `

  const result = await pool.query(query, [
    user.id,
    finalEmpresaId,
    vaga_id,
    nome_completo || user.nome_completo,
    email,
    whatsapp || null,
    cargo_pretendido || null,
    curriculo_url || null,
    documento_url || null,
    foto_url || null,
  ])

  return successResponse(result.rows[0], 201)
}

export const GET = withErrorHandler(handleGET)
export const POST = withErrorHandler(handlePOST)
