import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { signToken, AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth/jwt'
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(`register:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Muitas tentativas de cadastro. Aguarde 1 hora.' },
      { status: 429 },
    )
  }

  const { nome, email, password, telefone, conviteToken } = await request.json()

  if (!nome || !email || !password) {
    return NextResponse.json({ error: 'Nome, e-mail e senha obrigatorios' }, { status: 400 })
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: 'Senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número' },
      { status: 400 },
    )
  }

  // Check if email already exists
  const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.length > 0) {
    return NextResponse.json({ error: 'E-mail ja cadastrado' }, { status: 409 })
  }

  let role = 'candidato'
  let empresa_id: string | null = null

  // Check invite token
  if (conviteToken) {
    const { rows: convites } = await pool.query(
      'SELECT role, empresa_id, email FROM convites WHERE token = $1 AND usado = false AND expira_em > now()',
      [conviteToken],
    )
    if (convites.length > 0) {
      role = convites[0].role
      empresa_id = convites[0].empresa_id
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone)
     VALUES ($1, $2, $3, $4::role_type, $5, $6)
     RETURNING id, email, nome_completo, role, empresa_id`,
    [email, passwordHash, nome, role, empresa_id, telefone || null],
  )

  const user = rows[0]

  // Mark invite as used
  if (conviteToken) {
    await pool.query('UPDATE convites SET usado = true WHERE token = $1', [conviteToken])
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role })

  const response = NextResponse.json({ user })
  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)

  return response
}
