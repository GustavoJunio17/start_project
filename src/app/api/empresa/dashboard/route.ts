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

    // Se for gestor_rh, buscar apenas seus setores
    let setorIds: string[] = []
    if (user.role === 'gestor_rh') {
      const { rows } = await pool.query(
        `SELECT cargos_departamento_id FROM gestor_rh_setores WHERE user_id = $1`,
        [user.id]
      )
      setorIds = rows.map(r => r.cargos_departamento_id)
    }

    // Se for gestor_rh e não tem setores, retornar vazio
    if (user.role === 'gestor_rh' && setorIds.length === 0) {
      return NextResponse.json({
        stats: { vagas: 0, candidatos: 0, colaboradores: 0, testes: 0, aprovados: 0, reprovados: 0 },
        vagasData: [],
      })
    }

    // Buscar nomes dos setores se for gestor_rh
    let setorNomes: string[] = []
    if (setorIds.length > 0) {
      const { rows } = await pool.query(
        `SELECT nome FROM cargos_departamentos WHERE id = ANY($1::uuid[])`,
        [setorIds]
      )
      setorNomes = rows.map(r => r.nome)
    }

    // Buscar vagas
    let vagasQuery = db.from('vagas').select('id, titulo, departamento').eq('empresa_id', user.empresa_id)
    if (user.role === 'gestor_rh' && setorNomes.length > 0) {
      vagasQuery = vagasQuery.in('departamento', setorNomes)
    }
    const { data: vagas } = await vagasQuery

    // Buscar candidatos com login
    let candidatosQuery = db.from('candidatos').select('id, vaga_id, status_candidatura').eq('empresa_id', user.empresa_id)
    const { data: candidatos } = await candidatosQuery

    // Filtrar candidatos por vagas do gestor_rh
    const vagaIds = vagas?.map(v => v.id) || []
    const candidatosFiltrados = user.role === 'gestor_rh'
      ? (candidatos || []).filter(c => vagaIds.includes(c.vaga_id))
      : (candidatos || [])

    // Buscar colaboradores
    let colaboradoresQuery = db.from('colaboradores').select('id, departamento').eq('empresa_id', user.empresa_id)
    const { data: colaboradores } = await colaboradoresQuery

    // Filtrar colaboradores por setores do gestor_rh
    const colaboradoresFiltrados = user.role === 'gestor_rh' && setorNomes.length > 0
      ? (colaboradores || []).filter(c => c.departamento && setorNomes.includes(c.departamento))
      : (colaboradores || [])

    // Buscar candidaturas públicas
    const vagaIdList = vagaIds.length > 0 ? vagaIds : [null]
    const { rows: candidaturasPublicas } = await pool.query(
      `SELECT c.id, c.vaga_id, c.status
       FROM candidaturas c
       JOIN vagas v ON v.id = c.vaga_id
       WHERE v.empresa_id = $1 AND v.id = ANY($2::uuid[])`,
      [user.empresa_id, vagaIdList]
    )

    const vagas_list = vagas || []

    const aprovados = candidatosFiltrados.filter(
      c => c.status_candidatura === 'aprovado' || c.status_candidatura === 'contratado'
    ).length

    const reprovados = candidatosFiltrados.filter(
      c => c.status_candidatura === 'reprovado'
    ).length

    // Total de candidatos (com login + públicos)
    const totalCandidatos = candidatosFiltrados.length + candidaturasPublicas.length

    // Candidatos por vaga (com login + públicos)
    const vagasData = vagas_list.map(v => {
      const comLogin = candidatosFiltrados.filter(c => c.vaga_id === v.id).length
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
        colaboradores: colaboradoresFiltrados.length,
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
