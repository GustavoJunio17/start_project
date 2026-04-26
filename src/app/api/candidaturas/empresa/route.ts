import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { rows } = await pool.query(
    `SELECT c.*, v.titulo as vaga_titulo
     FROM candidaturas c
     JOIN vagas v ON v.id = c.vaga_id
     WHERE v.empresa_id = $1
     ORDER BY c.created_at DESC`,
    [user.empresa_id]
  )

  return NextResponse.json(rows)
}
