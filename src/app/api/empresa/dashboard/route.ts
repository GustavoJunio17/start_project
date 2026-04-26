import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'
import { createServerClient } from '@/lib/db/server'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const db = createServerClient()

    // Buscar vagas
    const { data: vagas } = await db
      .from('vagas')
      .select('id, titulo')
      .eq('empresa_id', user.empresa_id)

    // Buscar candidatos com login
    const { data: candidatos } = await db
      .from('candidatos')
      .select('id, vaga_id, status_candidatura')
      .eq('empresa_id', user.empresa_id)

    // Buscar colaboradores
    const { data: colaboradores } = await db
      .from('colaboradores')
      .select('id')
      .eq('empresa_id', user.empresa_id)

    // Buscar candidaturas públicas
    const { rows: candidaturasPublicas } = await pool.query(
      `SELECT c.id, c.vaga_id, c.status
       FROM candidaturas c
       JOIN vagas v ON v.id = c.vaga_id
       WHERE v.empresa_id = $1`,
      [user.empresa_id]
    )

    const vagas_list = vagas || []
    const candidatos_list = candidatos || []
    const colaboradores_list = colaboradores || []

    const aprovados = candidatos_list.filter(
      c => c.status_candidatura === 'aprovado' || c.status_candidatura === 'contratado'
    ).length

    const reprovados = candidatos_list.filter(
      c => c.status_candidatura === 'reprovado'
    ).length

    // Total de candidatos (com login + públicos)
    const totalCandidatos = candidatos_list.length + candidaturasPublicas.length

    // Candidatos por vaga (com login + públicos)
    const vagasData = vagas_list.map(v => {
      const comLogin = candidatos_list.filter(c => c.vaga_id === v.id).length
      const publicos = candidaturasPublicas.filter(c => c.vaga_id === v.id).length
      return {
        id: v.id,
        titulo: v.titulo.length > 15 ? v.titulo.substring(0, 15) + '...' : v.titulo,
        candidatos: comLogin + publicos,
      }
    })

    return NextResponse.json({
      stats: {
        vagas: vagas_list.length,
        candidatos: totalCandidatos,
        colaboradores: colaboradores_list.length,
        testes: 0,
        aprovados,
        reprovados,
      },
      vagasData,
    })
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
