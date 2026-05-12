import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const candidatura_id = url.searchParams.get('candidatura_id')
  const candidato_id = url.searchParams.get('candidato_id')

  if (!candidatura_id && !candidato_id) {
    return NextResponse.json({ error: 'Missing candidatura_id or candidato_id' }, { status: 400 })
  }

  let rows: any[]

  if (candidatura_id) {
    const res = await pool.query(
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
    rows = res.rows
  } else {
    const res = await pool.query(
      `SELECT tl.id, tl.token, tl.respondido, tl.resultado, tl.created_at, tl.expires_at,
              tt.nome AS template_nome
       FROM teste_links tl
       JOIN candidatos cand ON cand.id = tl.candidato_id
       JOIN templates_testes tt ON tt.id = tl.template_id
       WHERE tl.candidato_id = $1 AND cand.empresa_id = $2
       ORDER BY tl.created_at DESC`,
      [candidato_id, user.empresa_id],
    )
    rows = res.rows
  }

  return NextResponse.json(rows)
}
