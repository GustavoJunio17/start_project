import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { getServerSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  const { password } = await request.json()

  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: 'Senha deve ter no minimo 8 caracteres, uma maiuscula, uma minuscula e um numero' },
      { status: 400 },
    )
  }

  const hash = await bcrypt.hash(password, 10)
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, session.userId])

  return NextResponse.json({ success: true })
}
