import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT tl.id, tl.respondido, tl.expires_at,
              tt.nome AS template_nome, tt.questoes_ids,
              c.nome AS nome, 'candidato' AS tipo
       FROM teste_links tl
       JOIN templates_testes tt ON tt.id = tl.template_id
       JOIN candidaturas c ON c.id = tl.candidatura_id
       WHERE tl.token = $1
       UNION ALL
       SELECT ctl.id, ctl.respondido, ctl.expires_at,
              tt.nome AS template_nome, tt.questoes_ids,
              col.nome AS nome, 'colaborador' AS tipo
       FROM colaborador_teste_links ctl
       JOIN templates_testes tt ON tt.id = ctl.template_id
       JOIN colaboradores col ON col.id = ctl.colaborador_id
       WHERE ctl.token = $1
     ) combined LIMIT 1`,
    [token],
  )

  if (rows.length === 0) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })

  const link = rows[0]
  if (link.respondido) return NextResponse.json({ error: 'Este teste já foi respondido' }, { status: 410 })
  if (new Date(link.expires_at) < new Date()) return NextResponse.json({ error: 'Este link expirou' }, { status: 410 })

  const { rows: questoes } = await pool.query(
    `SELECT id, pergunta, opcoes FROM questoes_disc WHERE id = ANY($1)`,
    [link.questoes_ids],
  )

  const ordered = (link.questoes_ids as string[])
    .map((id: string) => questoes.find((q: any) => q.id === id))
    .filter(Boolean)

  return NextResponse.json({
    nome: link.nome,
    tipo: link.tipo,
    template_nome: link.template_nome,
    questoes: ordered,
  })
}
