import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: colaborador_id } = await params
  const { template_id } = await request.json()

  if (!template_id) return NextResponse.json({ error: 'template_id obrigatório' }, { status: 400 })

  const { rows: colabRows } = await pool.query(
    `SELECT id, nome FROM colaboradores WHERE id = $1 AND empresa_id = $2`,
    [colaborador_id, user.empresa_id],
  )
  if (colabRows.length === 0) return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 })

  const { rows: tmplRows } = await pool.query(
    `SELECT id FROM templates_testes WHERE id = $1 AND empresa_id = $2`,
    [template_id, user.empresa_id],
  )
  if (tmplRows.length === 0) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  const token = randomBytes(32).toString('hex')

  await pool.query(
    `INSERT INTO colaborador_teste_links (colaborador_id, template_id, token)
     VALUES ($1, $2, $3)`,
    [colaborador_id, template_id, token],
  )

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const link = `${base}/testes/responder/${token}`

  return NextResponse.json({ link, token }, { status: 201 })
}
