import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let rows

  if (user.role === 'gestor_rh') {
    const result = await pool.query(
      `SELECT c.* FROM colaboradores c
       WHERE c.empresa_id = $1
         AND c.departamento IN (
           SELECT cd.nome FROM gestor_rh_setores grs
           JOIN cargos_departamentos cd ON grs.cargos_departamento_id = cd.id
           WHERE grs.user_id = $2
         )
       ORDER BY c.nome`,
      [user.empresa_id, user.id],
    )
    rows = result.rows
  } else {
    const result = await pool.query(
      'SELECT * FROM colaboradores WHERE empresa_id = $1 ORDER BY nome',
      [user.empresa_id],
    )
    rows = result.rows
  }

  return NextResponse.json(rows)
}
