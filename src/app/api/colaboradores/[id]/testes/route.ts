import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: colaborador_id } = await params

  try {
    const { rows: colabRows } = await pool.query(
      `SELECT id FROM colaboradores WHERE id = $1 AND empresa_id = $2`,
      [colaborador_id, user.empresa_id],
    )
    if (colabRows.length === 0) return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 })

    const { rows } = await pool.query(
      `SELECT ctl.id, ctl.token, ctl.respondido, ctl.resultado, ctl.created_at, ctl.expires_at,
              tt.nome AS template_nome
       FROM colaborador_teste_links ctl
       JOIN templates_testes tt ON tt.id = ctl.template_id
       WHERE ctl.colaborador_id = $1
       ORDER BY ctl.created_at DESC`,
      [colaborador_id],
    )

    return NextResponse.json(rows)
  } catch (err: any) {
    console.error('[colaborador-testes]', err?.message ?? err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
