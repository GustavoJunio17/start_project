import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { candidatura_id, candidato_id, parar, comecar, continuar, acao, enviar } = body

  if (!candidatura_id && !candidato_id) {
    return NextResponse.json({ error: 'candidatura_id ou candidato_id obrigatório' }, { status: 400 })
  }
  if (!parar?.trim() && !comecar?.trim() && !continuar?.trim() && !acao?.trim()) {
    return NextResponse.json({ error: 'Preencha pelo menos um campo do feedback' }, { status: 400 })
  }

  try {
    if (candidatura_id) {
      const check = await pool.query(
        `SELECT c.id FROM candidaturas c JOIN vagas v ON c.vaga_id = v.id
         WHERE c.id = $1 AND v.empresa_id = $2`,
        [candidatura_id, user.empresa_id],
      )
      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO feedbacks
        (empresa_id, candidatura_id, candidato_id, autor_id, tipo, parar, comecar, continuar, acao, visivel_para_candidato, data_envio)
       VALUES ($1, $2, $3, $4, 'externo_candidato', $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        user.empresa_id,
        candidatura_id || null,
        candidato_id || null,
        user.id,
        parar || null,
        comecar || null,
        continuar || null,
        acao || null,
        !!enviar,
        enviar ? new Date().toISOString() : null,
      ],
    )
    return NextResponse.json({ success: true, feedback: rows[0] })
  } catch (e) {
    console.error('Erro ao criar feedback:', e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const candidatura_id = searchParams.get('candidatura_id')
  const candidato_id = searchParams.get('candidato_id')

  if (!candidatura_id && !candidato_id) {
    return NextResponse.json({ error: 'Informe candidatura_id ou candidato_id' }, { status: 400 })
  }

  try {
    const filterCol = candidatura_id ? 'f.candidatura_id' : 'f.candidato_id'
    const filterVal = candidatura_id || candidato_id
    const { rows } = await pool.query(
      `SELECT f.*, u.nome_completo AS autor_nome
       FROM feedbacks f
       LEFT JOIN users u ON u.id = f.autor_id
       WHERE ${filterCol} = $1 AND f.empresa_id = $2 AND f.tipo = 'externo_candidato'
       ORDER BY f.created_at DESC`,
      [filterVal, user.empresa_id],
    )
    return NextResponse.json(rows)
  } catch (e) {
    console.error('Erro ao listar feedbacks:', e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
