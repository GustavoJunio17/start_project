import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

/**
 * GET /api/empresas/[id]/vagas
 * Listar todas as vagas de uma empresa
 * - Admin/gestor_rh da empresa podem listar
 * - Super_admin/super_gestor podem listar
 */
async function handleGET(req: NextRequest, context?: { params?: { id: string } }) {
  const params = context?.params
  if (!params?.id) {
    return errorResponse('ID da empresa nao fornecido', 400)
  }

  const user = await getServerUser()
  if (!user) {
    return errorResponse('Nao autenticado', 401)
  }

  const { id: empresaId } = params

  // Verificar se a empresa existe
  const empresaResult = await pool.query('SELECT * FROM empresas WHERE id = $1', [empresaId])
  if (empresaResult.rows.length === 0) {
    return errorResponse('Empresa nao encontrada', 404)
  }

  // Verificar permissão
  const hasPermission = 
    user.role === 'super_admin' || 
    user.role === 'super_gestor' || 
    ((user.role === 'admin' || user.role === 'gestor_rh') && empresaId === user.empresa_id)

  if (!hasPermission) {
    return errorResponse('Voce nao tem permissao para listar vagas desta empresa', 403)
  }

  const query = `
    SELECT v.*, COUNT(c.id)::int as total_candidatos
    FROM vagas v
    LEFT JOIN candidatos c ON v.id = c.vaga_id
    WHERE v.empresa_id = $1
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `

  const result = await pool.query(query, [empresaId])
  return successResponse(result.rows)
}

export const GET = withErrorHandler(handleGET)
