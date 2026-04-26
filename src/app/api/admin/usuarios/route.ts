import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { requireRole, successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'

const DEFAULT_PASSWORD = 'Senha123!'

async function handlePOST(request: NextRequest) {
  await requireRole(['super_admin', 'super_gestor'])

  const { email, nome_completo, telefone, role, empresa_id } = await request.json()

  if (!email || !nome_completo || !role || !empresa_id) {
    return errorResponse('Email, nome_completo, role e empresa_id obrigatorios', 400)
  }

  if (!['user_empresa', 'gestor_rh', 'colaborador'].includes(role)) {
    return errorResponse('Role invalida. Use admin, gestor_rh ou colaborador', 400)
  }

  const { rows: existing } = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email],
  )
  if (existing.length > 0) {
    return errorResponse('Email ja cadastrado', 409)
  }

  const { rows: empresaCheck } = await pool.query(
    'SELECT id FROM empresas WHERE id = $1',
    [empresa_id],
  )
  if (empresaCheck.length === 0) {
    return errorResponse('Empresa nao encontrada', 404)
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone, ativo)
     VALUES ($1, $2, $3, $4::role_type, $5, $6, true)
     RETURNING id, email, nome_completo, role, empresa_id, telefone, created_at`,
    [email, passwordHash, nome_completo, role, empresa_id, telefone || null],
  )

  return successResponse(
    { user: rows[0], message: `Usuário criado. Senha padrão: ${DEFAULT_PASSWORD}` },
    201,
  )
}

export const POST = withErrorHandler(handlePOST)
