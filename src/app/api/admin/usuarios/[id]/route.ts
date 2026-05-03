import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { requireRole, successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'

async function handlePUT(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const caller = await requireRole(['super_admin', 'super_gestor'])

  const { id } = await context.params
  const { nome_completo, role, password, ativo } = await request.json()

  if (role !== undefined && caller.role === 'super_gestor' && ['super_admin', 'super_gestor'].includes(role)) {
    return errorResponse('Super Gestor não pode atribuir roles de super_admin ou super_gestor', 403)
  }

  const queryParts: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (nome_completo !== undefined) {
    queryParts.push(`nome_completo = $${paramIndex++}`)
    values.push(nome_completo)
  }

  if (role !== undefined) {
    queryParts.push(`role = $${paramIndex++}::role_type`)
    values.push(role)
  }

  if (ativo !== undefined) {
    queryParts.push(`ativo = $${paramIndex++}`)
    values.push(ativo)
  }

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10)
    queryParts.push(`password_hash = $${paramIndex++}`)
    values.push(passwordHash)
  }

  if (queryParts.length === 0) {
    return errorResponse('Nenhum dado para atualizar', 400)
  }

  values.push(id)
  const { rows } = await pool.query(
    `UPDATE users SET ${queryParts.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, nome_completo, role, ativo`,
    values,
  )

  if (rows.length === 0) {
    return errorResponse('Usuário não encontrado', 404)
  }

  return successResponse({ user: rows[0], message: 'Usuário atualizado com sucesso' })
}

export const PUT = withErrorHandler(handlePUT)
