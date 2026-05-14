import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { candidatura_id, candidato_id, texto } = await request.json()
  if (!texto?.trim()) return NextResponse.json({ error: 'texto obrigatório' }, { status: 400 })
  if (!candidatura_id && !candidato_id) {
    return NextResponse.json({ error: 'candidatura_id ou candidato_id obrigatório' }, { status: 400 })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO observacoes_candidato
        (empresa_id, autor_id, candidatura_id, candidato_id, texto)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.empresa_id, user.id, candidatura_id || null, candidato_id || null, texto.trim()],
    )
    return NextResponse.json({ success: true, observacao: rows[0] })
  } catch (e) {
    console.error('Erro ao criar observação:', e)
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
    const filterCol = candidatura_id ? 'o.candidatura_id' : 'o.candidato_id'
    const filterVal = candidatura_id || candidato_id
    const { rows } = await pool.query(
      `SELECT o.*, u.nome_completo AS autor_nome
       FROM observacoes_candidato o
       LEFT JOIN users u ON u.id = o.autor_id
       WHERE ${filterCol} = $1 AND o.empresa_id = $2
       ORDER BY o.created_at DESC`,
      [filterVal, user.empresa_id],
    )
    return NextResponse.json(rows)
  } catch (e) {
    console.error('Erro ao listar observações:', e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  try {
    const { rows } = await pool.query(
      `DELETE FROM observacoes_candidato WHERE id = $1 AND empresa_id = $2 RETURNING id`,
      [id, user.empresa_id],
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erro ao deletar observação:', e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
