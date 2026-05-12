import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'
import { randomBytes } from 'crypto'

function generateToken() {
  return randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { candidatura_id, candidato_id, template_id } = await request.json()

  if ((!candidatura_id && !candidato_id) || !template_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    let insertValues: [string, string | null, string | null]

    if (candidatura_id) {
      const { rows } = await pool.query(
        `SELECT c.id FROM candidaturas c
         JOIN vagas v ON v.id = c.vaga_id
         WHERE c.id = $1 AND v.empresa_id = $2`,
        [candidatura_id, user.empresa_id],
      )
      if (rows.length === 0) return NextResponse.json({ error: 'Candidatura not found' }, { status: 404 })
      insertValues = [template_id, candidatura_id, null]
    } else {
      const { rows } = await pool.query(
        `SELECT id FROM candidatos WHERE id = $1 AND empresa_id = $2`,
        [candidato_id, user.empresa_id],
      )
      if (rows.length === 0) return NextResponse.json({ error: 'Candidato not found' }, { status: 404 })
      insertValues = [template_id, null, candidato_id]
    }

    const token = generateToken()

    const { rows } = await pool.query(
      `INSERT INTO teste_links (template_id, candidatura_id, candidato_id, token)
       VALUES ($1, $2, $3, $4)
       RETURNING id, token`,
      [...insertValues, token],
    )

    const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/testes/responder/${rows[0].token}`

    return NextResponse.json({ link, token: rows[0].token }, { status: 201 })
  } catch (error) {
    console.error('Erro ao gerar link:', error)
    return NextResponse.json({ error: 'Erro ao gerar link' }, { status: 500 })
  }
}
