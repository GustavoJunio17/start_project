import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ error: 'Token obrigatorio' }, { status: 400 })
  }

  const { rows } = await pool.query(
    'SELECT role, empresa_id, email FROM convites WHERE token = $1 AND usado = false AND expira_em > now()',
    [token],
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Convite invalido ou expirado' }, { status: 400 })
  }

  const convite = rows[0]

  return NextResponse.json({
    role: convite.role,
    empresa_id: convite.empresa_id,
    email: convite.email,
  })
}
