import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

/**
 * GET /api/admin/empresas
 * Listar todas as empresas - apenas super_admin e super_gestor
 */
async function handleGET(req: NextRequest) {
  const user = await getServerUser()

  if (!user) {
    return errorResponse('Voce precisa estar autenticado', 401)
  }

  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    return errorResponse('Apenas super_admin e super_gestor podem listar empresas', 403)
  }

  const query = `
    SELECT 
      e.id,
      e.nome,
      e.cnpj,
      e.segmento,
      e.email_contato,
      e.telefone,
      e.status,
      e.plano,
      e.data_cadastro,
      (SELECT COUNT(*) FROM users WHERE empresa_id = e.id) as total_usuarios,
      (SELECT COUNT(*) FROM vagas WHERE empresa_id = e.id) as total_vagas,
      (SELECT COUNT(*) FROM candidatos WHERE empresa_id = e.id) as total_candidatos
    FROM empresas e
    ORDER BY e.data_cadastro DESC
  `

  const result = await pool.query(query)

  const rows = result.rows.map((r) => ({
    ...r,
    total_usuarios: parseInt(r.total_usuarios),
    total_vagas: parseInt(r.total_vagas),
    total_candidatos: parseInt(r.total_candidatos),
  }))

  return successResponse(rows)
}

/**
 * PUT /api/admin/empresas/[id]
 * Atualizar empresa - apenas super_admin e super_gestor
 */
async function handlePUT(req: NextRequest) {
  const user = await getServerUser()

  if (!user) {
    return errorResponse('Voce precisa estar autenticado', 401)
  }

  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    return errorResponse('Apenas super_admin e super_gestor podem atualizar empresas', 403)
  }

  // Extrair id da URL
  const url = new URL(req.url)
  const id = url.pathname.split('/').pop()

  if (!id) {
    return errorResponse('ID da empresa não fornecido', 400)
  }

  const body = await req.json()
  const { nome, email_contato, telefone, status, plano } = body

  // Verificar se empresa existe
  const empresaResult = await pool.query('SELECT id FROM empresas WHERE id = $1', [id])
  if (empresaResult.rows.length === 0) {
    return errorResponse('Empresa não encontrada', 404)
  }

  const updateQuery = `
    UPDATE empresas 
    SET 
      nome = COALESCE($1, nome),
      email_contato = COALESCE($2, email_contato),
      telefone = COALESCE($3, telefone),
      status = COALESCE($4, status),
      plano = COALESCE($5, plano)
    WHERE id = $6
    RETURNING *
  `

  const result = await pool.query(updateQuery, [
    nome || null,
    email_contato || null,
    telefone || null,
    status || null,
    plano || null,
    id,
  ])

  return successResponse(result.rows[0])
}

export const GET = withErrorHandler(handleGET)
export const PUT = withErrorHandler(handlePUT)
