import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(`reset:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 })
  }

  const { token, password } = await request.json()
  if (!token || !password) {
    return NextResponse.json({ error: 'Token e senha obrigatorios' }, { status: 400 })
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return NextResponse.json(
      { error: 'Senha deve ter no minimo 8 caracteres, uma maiuscula, uma minuscula e um numero' },
      { status: 400 },
    )
  }

  const { rows } = await pool.query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token = $1 AND used = false AND expires_at > now()`,
    [token],
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Token invalido ou expirado' }, { status: 400 })
  }

  const { id: tokenId, user_id: userId } = rows[0]
  const hash = await bcrypt.hash(password, 10)

  await pool.query('BEGIN')
  try {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId])
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenId])
    await pool.query('COMMIT')
  } catch (err) {
    await pool.query('ROLLBACK')
    throw err
  }

  return NextResponse.json({ message: 'Senha redefinida com sucesso.' })
}
