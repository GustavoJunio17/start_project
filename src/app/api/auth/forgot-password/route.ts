import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import pool from '@/lib/db/pool'
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit'

// Ensure the reset tokens table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 })
  }

  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'E-mail obrigatorio' }, { status: 400 })

  // Always return 200 to avoid user enumeration
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1 AND ativo = true', [email])
  if (rows.length === 0) {
    return NextResponse.json({ message: 'Se o e-mail existir, voce recebera instrucoes.' })
  }

  await ensureTable()

  const userId = rows[0].id
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Invalidate existing tokens for this user
  await pool.query('UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false', [userId])

  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt],
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`

  // In production, send email here. For now, log the link.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[password-reset] ${email} → ${resetUrl}`)
    return NextResponse.json({ message: 'Link gerado.', resetUrl })
  }

  console.log(`[password-reset] Token gerado para ${email}`)
  return NextResponse.json({ message: 'Se o e-mail existir, voce recebera instrucoes.' })
}
