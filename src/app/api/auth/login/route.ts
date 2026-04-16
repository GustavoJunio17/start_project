import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { signToken, AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha obrigatorios' }, { status: 400 })
  }

  const { rows } = await pool.query(
    'SELECT id, email, password_hash, nome_completo, role, empresa_id, ativo FROM users WHERE email = $1',
    [email],
  )

  const user = rows[0]
  if (!user) {
    return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
  }

  if (!user.ativo) {
    return NextResponse.json({ error: 'Conta desativada' }, { status: 403 })
  }

  if (!user.password_hash) {
    return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
  }

  // Update ultimo_login
  await pool.query('UPDATE users SET ultimo_login = now() WHERE id = $1', [user.id])

  const token = signToken({ userId: user.id, email: user.email, role: user.role })

  const response = NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      nome_completo: user.nome_completo,
      role: user.role,
      empresa_id: user.empresa_id,
    },
  })

  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)

  return response
}
