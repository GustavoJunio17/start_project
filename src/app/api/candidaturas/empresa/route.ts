import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let query = `SELECT c.*, v.titulo as vaga_titulo, v.cargo as vaga_cargo, v.departamento as vaga_departamento, v.salario_minimo as vaga_salario
     FROM candidaturas c
     JOIN vagas v ON v.id = c.vaga_id
     WHERE v.empresa_id = $1`
  const params: any[] = [user.empresa_id]

  // Se for gestor_rh, filtrar apenas seus setores
  if (user.role === 'gestor_rh') {
    query += ` AND v.departamento IN (
      SELECT cd.nome FROM gestor_rh_setores grs
      JOIN cargos_departamentos cd ON grs.cargos_departamento_id = cd.id
      WHERE grs.user_id = $2
    )`
    params.push(user.id)
  }

  query += ` ORDER BY c.created_at DESC`

  const { rows } = await pool.query(query, params)

  return NextResponse.json(rows)
}
