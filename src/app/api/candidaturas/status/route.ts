import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { candidatura_id, status } = await request.json()

  if (!candidatura_id || !status) {
    return NextResponse.json({ error: 'candidatura_id e status obrigatorios' }, { status: 400 })
  }

  if (!['pendente', 'lido', 'rejeito', 'contratado', 'banco_talentos'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  try {
    const { rows } = await pool.query(
      `UPDATE candidaturas SET status = $1 WHERE id = $2 AND vaga_id IN (
        SELECT id FROM vagas WHERE empresa_id = $3
      ) RETURNING id`,
      [status, candidatura_id, user.empresa_id],
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Status alterado para ${status}` })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const candidatura_id = searchParams.get('id')

  if (!candidatura_id) {
    return NextResponse.json({ error: 'candidatura_id obrigatorio' }, { status: 400 })
  }

  try {
    const { rows } = await pool.query(
      `DELETE FROM candidaturas WHERE id = $1 AND vaga_id IN (
        SELECT id FROM vagas WHERE empresa_id = $2
      ) RETURNING id`,
      [candidatura_id, user.empresa_id],
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Candidatura deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar candidatura:', error)
    return NextResponse.json({ error: 'Erro ao deletar candidatura' }, { status: 500 })
  }
}
