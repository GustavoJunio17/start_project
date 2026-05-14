import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

/**
 * Retorna o histórico completo de um candidato dentro da empresa:
 * - Todas as candidaturas para vagas da empresa
 * - Todos os testes respondidos
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 })

  try {
    const [candidaturas, testes] = await Promise.all([
      pool.query(
        `SELECT c.id, c.vaga_id, c.status, c.created_at,
                v.titulo AS vaga_titulo, v.categoria AS vaga_categoria
         FROM candidaturas c
         JOIN vagas v ON v.id = c.vaga_id
         WHERE v.empresa_id = $1 AND lower(c.email) = lower($2)
         ORDER BY c.created_at DESC`,
        [user.empresa_id, email],
      ),
      pool.query(
        `SELECT rt.id, rt.tipo, rt.score, rt.created_at, tt.nome AS template_nome
         FROM respostas_testes rt
         LEFT JOIN candidatos c ON c.id = rt.candidato_id
         LEFT JOIN template_testes tt ON tt.id = rt.template_id
         WHERE c.empresa_id = $1 AND lower(c.email) = lower($2)
         ORDER BY rt.created_at DESC`,
        [user.empresa_id, email],
      ).catch(() => ({ rows: [] as Array<Record<string, unknown>> })),
    ])

    return NextResponse.json({
      candidaturas: candidaturas.rows,
      testes: testes.rows,
    })
  } catch (e) {
    console.error('Erro ao buscar histórico:', e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
