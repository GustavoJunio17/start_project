import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

async function handleGET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getServerUser()

  if (!user) {
    return errorResponse('Voce precisa estar autenticado', 401)
  }

  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    return errorResponse('Apenas super_admin e super_gestor podem acessar empresas', 403)
  }

  const { id } = await context.params

  try {
    const result = await pool.query(
      `
      SELECT id, nome, cnpj, segmento, email_contato, status, plano, data_cadastro
      FROM empresas
      WHERE id = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return errorResponse('Empresa não encontrada', 404)
    }

    return successResponse(result.rows[0])
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return errorResponse('Erro ao buscar empresa', 500)
  }
}

async function handlePATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getServerUser()

  if (!user) {
    return errorResponse('Voce precisa estar autenticado', 401)
  }

  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    return errorResponse('Apenas super_admin e super_gestor podem atualizar empresas', 403)
  }

  const { id } = await context.params
  const body = await req.json()

  try {
    const empresaResult = await pool.query(
      'SELECT id FROM empresas WHERE id = $1',
      [id]
    )

    if (empresaResult.rows.length === 0) {
      return errorResponse('Empresa não encontrada', 404)
    }

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    const validStatuses = ['ativa', 'inativa', 'bloqueada', 'trial']
    const validPlanos = ['free', 'starter', 'profissional', 'enterprise']

    if (body.status !== undefined) {
      if (!validStatuses.includes(body.status)) {
        return errorResponse(
          `Status inválido. Use: ${validStatuses.join(', ')}`,
          400
        )
      }
      updates.push(`status = $${paramCount}`)
      values.push(body.status)
      paramCount++
    }

    if (body.plano !== undefined) {
      if (!validPlanos.includes(body.plano)) {
        return errorResponse(
          `Plano inválido. Use: ${validPlanos.join(', ')}`,
          400
        )
      }
      updates.push(`plano = $${paramCount}`)
      values.push(body.plano)
      paramCount++
    }

    if (body.email_contato !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email_contato)) {
        return errorResponse('Email inválido', 400)
      }
      updates.push(`email_contato = $${paramCount}`)
      values.push(body.email_contato)
      paramCount++
    }

    if (body.segmento !== undefined) {
      updates.push(`segmento = $${paramCount}`)
      values.push(body.segmento)
      paramCount++
    }

    if (updates.length === 0) {
      return errorResponse('Nenhum campo para atualizar', 400)
    }

    values.push(id)
    const query = `
      UPDATE empresas
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome, status, plano, email_contato, segmento
    `

    const result = await pool.query(query, values)

    return successResponse(
      {
        message: 'Empresa atualizada com sucesso',
        empresa: result.rows[0],
      },
      200
    )
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    return errorResponse('Erro ao atualizar empresa', 500)
  }
}

async function handleDELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getServerUser()

  if (!user) {
    return errorResponse('Voce precisa estar autenticado', 401)
  }

  if (user.role !== 'super_admin') {
    return errorResponse('Apenas super_admin pode deletar empresas', 403)
  }

  const { id } = await context.params

  try {
    const empresaResult = await pool.query(
      'SELECT id, nome FROM empresas WHERE id = $1',
      [id]
    )

    if (empresaResult.rows.length === 0) {
      return errorResponse('Empresa não encontrada', 404)
    }

    const empresa = empresaResult.rows[0]

    // Hard delete: first user records associated with the company, then the company itself
    await pool.query('DELETE FROM users WHERE empresa_id = $1', [id])
    await pool.query('DELETE FROM empresas WHERE id = $1', [id])

    return successResponse(
      {
        message: `Empresa "${empresa.nome}" deletada com sucesso!`,
        empresa_id: id,
      },
      200
    )
  } catch (error) {
    console.error('Erro ao deletar empresa:', error)
    return errorResponse('Erro ao deletar empresa', 500)
  }
}

export const GET = withErrorHandler(handleGET)
export const PATCH = withErrorHandler(handlePATCH)
export const DELETE = withErrorHandler(handleDELETE)
