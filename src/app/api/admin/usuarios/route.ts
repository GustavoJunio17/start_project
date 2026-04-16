import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'

const DEFAULT_PASSWORD = 'Senha123!'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (you can add proper auth later)
    const authHeader = request.headers.get('authorization')
    
    const { email, nome_completo, telefone, role, empresa_id } = await request.json()

    if (!email || !nome_completo || !role || !empresa_id) {
      return NextResponse.json(
        { error: 'Email, nome_completo, role e empresa_id obrigatorios' },
        { status: 400 }
      )
    }

    if (!['admin', 'gestor_rh', 'colaborador'].includes(role)) {
      return NextResponse.json(
        { error: 'Role invalida. Use admin, gestor_rh ou colaborador' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email ja cadastrado' },
        { status: 409 }
      )
    }

    // Check if empresa exists
    const { rows: empresaCheck } = await pool.query(
      'SELECT id FROM empresas WHERE id = $1',
      [empresa_id]
    )
    if (empresaCheck.length === 0) {
      return NextResponse.json(
        { error: 'Empresa nao encontrada' },
        { status: 404 }
      )
    }

    // Hash the default password
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

    // Create the user
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone, ativo)
       VALUES ($1, $2, $3, $4::role_type, $5, $6, true)
       RETURNING id, email, nome_completo, role, empresa_id, telefone, created_at`,
      [email, passwordHash, nome_completo, role, empresa_id, telefone || null]
    )

    const user = rows[0]

    return NextResponse.json({
      user,
      message: `Usuário criado com sucesso. Senha padrão: ${DEFAULT_PASSWORD}`,
    })
  } catch (error) {
    console.error('[admin/usuarios] failed to create user', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar usuário' },
      { status: 500 }
    )
  }
}
