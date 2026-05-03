import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'

const SETUP_SECRET = process.env.SETUP_SECRET || 'startpro-setup-2026'
const DB_UNAVAILABLE_MESSAGE = 'Banco de dados indisponivel. Inicie o Postgres e tente novamente.'

function isDbConnectionRefused(error: unknown) {
  const err = error as { code?: string; errors?: Array<{ code?: string }>; message?: string }

  if (err?.code === 'ECONNREFUSED') return true
  if (Array.isArray(err?.errors) && err.errors.some(cause => cause?.code === 'ECONNREFUSED')) return true
  return typeof err?.message === 'string' && err.message.includes('ECONNREFUSED')
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, password, role, secret } = await request.json()

    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Codigo secreto invalido' }, { status: 403 })
    }

    if (!nome || !email || !password || !role) {
      return NextResponse.json({ error: 'Todos os campos sao obrigatorios' }, { status: 400 })
    }

    if (!['super_admin', 'super_gestor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Role invalida. Apenas super_admin, super_gestor e admin' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no minimo 6 caracteres' }, { status: 400 })
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.length > 0) {
      return NextResponse.json({ error: 'E-mail ja cadastrado' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, nome_completo, role)
       VALUES ($1, $2, $3, $4::role_type)
       RETURNING id, email, nome_completo, role`,
      [email, passwordHash, nome, role],
    )

    return NextResponse.json({ user: rows[0] })
  } catch (error) {
    console.error('[setup-admin] failed to create admin', error)

    if (isDbConnectionRefused(error)) {
      return NextResponse.json({ error: DB_UNAVAILABLE_MESSAGE }, { status: 503 })
    }

    return NextResponse.json({ error: 'Erro interno ao criar conta administrativa' }, { status: 500 })
  }
}
