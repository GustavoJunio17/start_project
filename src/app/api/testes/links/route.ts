import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const candidatura_id = new URL(request.url).searchParams.get('candidatura_id')
  if (!candidatura_id) return NextResponse.json({ error: 'Missing candidatura_id' }, { status: 400 })

  const { rows } = await pool.query(
    `SELECT tl.id, tl.token, tl.respondido, tl.resultado, tl.created_at, tl.expires_at,
            tt.nome AS template_nome
     FROM teste_links tl
     JOIN candidaturas c ON c.id = tl.candidatura_id
     JOIN vagas v ON v.id = c.vaga_id
     JOIN templates_testes tt ON tt.id = tl.template_id
     WHERE tl.candidatura_id = $1 AND v.empresa_id = $2
     ORDER BY tl.created_at DESC`,
    [candidatura_id, user.empresa_id],
  )

  return NextResponse.json(rows)
}
