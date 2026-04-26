import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

/**
 * GET /api/vagas/[id]/candidatos
 * Listar todos os candidatos de uma vaga específica
 * - Admin/gestor_rh da empresa podem listar
 * - Super_admin/super_gestor podem listar
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

  const { id: vagaId } = params

  // Verificar se a vaga existe
  const vagaResult = await pool.query('SELECT * FROM vagas WHERE id = $1', [vagaId])
  if (vagaResult.rows.length === 0) {
    return errorResponse('Vaga nao encontrada', 404)
  }

  const vaga = vagaResult.rows[0]

  // Verificar permissão
  const hasPermission = 
    user.role === 'super_admin' || 
    user.role === 'super_gestor' || 
    ((user.role === 'user_empresa' || user.role === 'gestor_rh') && vaga.empresa_id === user.empresa_id)

  if (!hasPermission) {
    return errorResponse('Voce nao tem permissao para listar candidatos desta vaga', 403)
  }

  const query = `
    SELECT c.*, u.email as user_email, u.nome_completo as user_nome
    FROM candidatos c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.vaga_id = $1
    ORDER BY c.status_candidatura, c.match_score DESC
  `

  const result = await pool.query(query, [vagaId])
  return successResponse(result.rows)
}

export const GET = withErrorHandler(handleGET)
