import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const { rows: gestorRows } = await pool.query(
    'SELECT id FROM users WHERE id = $1 AND empresa_id = $2 AND role = $3',
    [id, user.empresa_id, 'gestor_rh'],
  )

  if (gestorRows.length === 0) {
    return NextResponse.json({ error: 'Gestor RH nao encontrado' }, { status: 404 })
  }

  await pool.query('BEGIN')
  try {
    await pool.query('DELETE FROM gestor_rh_setores WHERE user_id = $1', [id])
    await pool.query('DELETE FROM users WHERE id = $1', [id])
    await pool.query('COMMIT')

    return NextResponse.json({ message: 'Gestor RH removido com sucesso' })
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  }
}
