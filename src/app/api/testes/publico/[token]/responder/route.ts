import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { respostas } = await request.json() as { respostas: Record<string, 'D' | 'I' | 'S' | 'C'> }

  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT id, respondido, expires_at, 'candidato' AS tipo, NULL::uuid AS colaborador_id
       FROM teste_links WHERE token = $1
       UNION ALL
       SELECT id, respondido, expires_at, 'colaborador' AS tipo, colaborador_id
       FROM colaborador_teste_links WHERE token = $1
     ) combined LIMIT 1`,
    [token],
  )

  if (rows.length === 0) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  const link = rows[0]
  if (link.respondido) return NextResponse.json({ error: 'Já respondido' }, { status: 400 })
  if (new Date(link.expires_at) < new Date()) return NextResponse.json({ error: 'Link expirado' }, { status: 400 })

  const counts = { D: 0, I: 0, S: 0, C: 0 }
  const dims = Object.values(respostas)
  dims.forEach(d => { counts[d]++ })
  const total = dims.length || 1
  const perfil = {
    D: Math.round((counts.D / total) * 100),
    I: Math.round((counts.I / total) * 100),
    S: Math.round((counts.S / total) * 100),
    C: Math.round((counts.C / total) * 100),
  }

  const table = link.tipo === 'colaborador' ? 'colaborador_teste_links' : 'teste_links'
  await pool.query(
    `UPDATE ${table} SET respondido = true, resultado = $1 WHERE id = $2`,
    [JSON.stringify(perfil), link.id],
  )

  if (link.tipo === 'colaborador' && link.colaborador_id) {
    await pool.query(
      `UPDATE colaboradores SET perfil_disc = $1 WHERE id = $2`,
      [JSON.stringify(perfil), link.colaborador_id],
    )
  }

  return NextResponse.json({ success: true, perfil })
}
