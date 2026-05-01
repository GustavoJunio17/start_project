import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { createServerClient } from '@/lib/db/server'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const db = createServerClient()

    // Se for gestor_rh, buscar apenas seus setores
    let setorNomes: string[] = []
    if (user.role === 'gestor_rh') {
      const { rows } = await pool.query(
        `SELECT cd.nome FROM gestor_rh_setores grs
         JOIN cargos_departamentos cd ON grs.cargos_departamento_id = cd.id
         WHERE grs.user_id = $1`,
        [user.id]
      )
      setorNomes = rows.map(r => r.nome)
    }

    // Buscar vagas
    let query = db.from('vagas').select('*').eq('empresa_id', user.empresa_id).order('created_at', { ascending: false })

    if (user.role === 'gestor_rh' && setorNomes.length > 0) {
      query = query.in('departamento', setorNomes)
    } else if (user.role === 'gestor_rh' && setorNomes.length === 0) {
      return NextResponse.json([])
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    return NextResponse.json({ error: 'Erro ao buscar vagas' }, { status: 500 })
  }
}
