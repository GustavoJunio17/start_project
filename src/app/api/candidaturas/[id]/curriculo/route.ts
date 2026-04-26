import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { rows } = await pool.query(
    `SELECT c.curriculo, c.curriculo_nome, v.empresa_id
     FROM candidaturas c
     JOIN vagas v ON v.id = c.vaga_id
     WHERE c.id = $1`,
    [id]
  )

  if (!rows[0] || rows[0].empresa_id !== user.empresa_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { curriculo, curriculo_nome } = rows[0]
  return new NextResponse(curriculo, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${curriculo_nome}"`,
    },
  })
}
