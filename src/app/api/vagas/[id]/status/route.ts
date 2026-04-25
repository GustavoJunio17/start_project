import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import { canManageVagas } from '@/lib/auth/permissions'
import pool from '@/lib/db/pool'

/**
 * PUT /api/vagas/[id]/status
 * Atualizar status de uma vaga
 * - Rascunho pode ir para Aberta (confirmar)
 * - Aberta pode ir para Pausada ou Encerrada
 * - Nunca volta para Rascunho
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
    return errorResponse('Voce nao tem permissao para alterar status de vagas', 403)
  }

  const { id } = params
  const body = await req.json()
  const { status } = body

  if (!status || !['rascunho', 'aberta', 'pausada', 'encerrada'].includes(status)) {
    return errorResponse('Status invalido', 400)
  }

  // Verificar se a vaga existe e pertence à empresa do usuário
  const vagaResult = await pool.query('SELECT * FROM vagas WHERE id = $1', [id])
  if (vagaResult.rows.length === 0) {
    return errorResponse('Vaga nao encontrada', 404)
  }

  const vaga = vagaResult.rows[0]

  // Verificar permissão
  if (user.role !== 'super_admin' && user.role !== 'gestor_admin') {
    if (vaga.empresa_id !== user.empresa_id) {
      return errorResponse('Voce nao tem permissao para alterar esta vaga', 403)
    }
  }

  // Validar transições de estado
  if (vaga.status === 'rascunho' && status !== 'aberta' && status !== 'rascunho') {
    return errorResponse('Rascunhos so podem ser confirmados (passando para Aberta)', 400)
  }

  if (vaga.status !== 'rascunho' && status === 'rascunho') {
    return errorResponse('Vagas ja confirmadas nao podem voltar a Rascunho', 403)
  }

  const updateQuery = `
    UPDATE vagas
    SET status = $1
    WHERE id = $2
    RETURNING *
  `

  const result = await pool.query(updateQuery, [status, id])

  return successResponse(result.rows[0])
}

export const PUT = withErrorHandler(handlePUT)
