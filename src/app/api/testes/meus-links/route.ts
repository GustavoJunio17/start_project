import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(_request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { rows } = await pool.query(
      `SELECT tl.id, tl.token, tl.respondido, tl.resultado, tl.created_at, tl.expires_at,
              tt.nome AS template_nome,
              e.nome AS empresa_nome
       FROM teste_links tl
       JOIN templates_testes tt ON tt.id = tl.template_id
       JOIN candidatos cand ON cand.id = tl.candidato_id
       JOIN empresas e ON e.id = cand.empresa_id
       WHERE cand.user_id = $1
         AND tl.expires_at > now()
       ORDER BY tl.created_at DESC`,
      [user.id],
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Erro ao buscar meus links:', error)
    return NextResponse.json({ error: 'Erro ao buscar links' }, { status: 500 })
  }
}
