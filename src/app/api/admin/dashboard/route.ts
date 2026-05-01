import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const [
    totaisRes,
    empresasDetalheRes,
    empresasPorSegmentoRes,
    empresasPorPlanoRes,
    empresasPorStatusRes,
    vagasPorStatusRes,
    candidatosPorStatusRes,
    colaboradoresPorStatusRes,
    usuariosPorRoleRes,
    crescimentoMensalRes,
    atividadeRecenteRes,
  ] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM empresas) AS total_empresas,
        (SELECT COUNT(*) FROM users) AS total_usuarios,
        (SELECT COUNT(*) FROM candidatos) AS total_candidatos,
        (SELECT COUNT(*) FROM vagas) AS total_vagas,
        (SELECT COUNT(*) FROM vagas WHERE status = 'aberta') AS vagas_abertas,
        (SELECT COUNT(*) FROM colaboradores) AS total_colaboradores,
        (SELECT COUNT(*) FROM respostas_teste) AS total_testes,
        (SELECT COUNT(*) FROM feedbacks) AS total_feedbacks
    `),
    pool.query(`
      SELECT
        e.id,
        e.nome,
        e.segmento,
        e.plano,
        e.status,
        e.data_cadastro,
        COUNT(DISTINCT u.id) AS total_usuarios,
        COUNT(DISTINCT v.id) AS total_vagas,
        COUNT(DISTINCT v_ab.id) AS vagas_abertas,
        COUNT(DISTINCT c.id) AS total_candidatos,
        COUNT(DISTINCT col.id) AS total_colaboradores
      FROM empresas e
      LEFT JOIN users u ON u.empresa_id = e.id
      LEFT JOIN vagas v ON v.empresa_id = e.id
      LEFT JOIN vagas v_ab ON v_ab.empresa_id = e.id AND v_ab.status = 'aberta'
      LEFT JOIN candidatos c ON c.empresa_id = e.id
      LEFT JOIN colaboradores col ON col.empresa_id = e.id
      GROUP BY e.id, e.nome, e.segmento, e.plano, e.status, e.data_cadastro
      ORDER BY total_candidatos DESC
    `),
    pool.query(`
      SELECT segmento AS name, COUNT(*) AS value
      FROM empresas
      GROUP BY segmento
      ORDER BY value DESC
    `),
    pool.query(`
      SELECT plano AS name, COUNT(*) AS value
      FROM empresas
      GROUP BY plano
      ORDER BY value DESC
    `),
    pool.query(`
      SELECT status AS name, COUNT(*) AS value
      FROM empresas
      GROUP BY status
    `),
    pool.query(`
      SELECT status AS name, COUNT(*) AS value
      FROM vagas
      GROUP BY status
    `),
    pool.query(`
      SELECT status_candidatura AS name, COUNT(*) AS value
      FROM candidatos
      GROUP BY status_candidatura
      ORDER BY value DESC
    `),
    pool.query(`
      SELECT status AS name, COUNT(*) AS value
      FROM colaboradores
      GROUP BY status
    `),
    pool.query(`
      SELECT role AS name, COUNT(*) AS value
      FROM users
      GROUP BY role
      ORDER BY value DESC
    `),
    pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', data_cadastro), 'Mon/YY') AS mes,
        COUNT(*) AS empresas
      FROM empresas
      WHERE data_cadastro >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', data_cadastro)
      ORDER BY DATE_TRUNC('month', data_cadastro)
    `),
    pool.query(`
      (
        SELECT 'empresa' AS tipo, e.nome AS descricao, e.data_cadastro AS data
        FROM empresas e
        ORDER BY e.data_cadastro DESC
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 'candidato' AS tipo, c.nome_completo AS descricao, c.created_at AS data
        FROM candidatos c
        ORDER BY c.created_at DESC
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 'vaga' AS tipo, v.titulo AS descricao, v.created_at AS data
        FROM vagas v
        ORDER BY v.created_at DESC
        LIMIT 3
      )
      ORDER BY data DESC
      LIMIT 10
    `),
  ])

  const totais = totaisRes.rows[0]
  const candidatosPorStatus = candidatosPorStatusRes.rows
  const totalCandidatosComStatus = candidatosPorStatus.reduce((s: number, r: { value: string }) => s + parseInt(r.value), 0) || 1
  const aprovados = candidatosPorStatus.filter((r: { name: string }) => r.name === 'aprovado' || r.name === 'contratado').reduce((s: number, r: { value: string }) => s + parseInt(r.value), 0)
  const reprovados = candidatosPorStatus.filter((r: { name: string }) => r.name === 'reprovado').reduce((s: number, r: { value: string }) => s + parseInt(r.value), 0)

  return NextResponse.json({
    totais: {
      empresas: parseInt(totais.total_empresas),
      usuarios: parseInt(totais.total_usuarios),
      candidatos: parseInt(totais.total_candidatos),
      vagas: parseInt(totais.total_vagas),
      vagasAbertas: parseInt(totais.vagas_abertas),
      colaboradores: parseInt(totais.total_colaboradores),
      testes: parseInt(totais.total_testes),
      feedbacks: parseInt(totais.total_feedbacks),
      taxaAprovacao: Math.round((aprovados / totalCandidatosComStatus) * 100),
      taxaReprovacao: Math.round((reprovados / totalCandidatosComStatus) * 100),
    },
    empresasDetalhe: empresasDetalheRes.rows.map(r => ({
      ...r,
      total_usuarios: parseInt(r.total_usuarios),
      total_vagas: parseInt(r.total_vagas),
      vagas_abertas: parseInt(r.vagas_abertas),
      total_candidatos: parseInt(r.total_candidatos),
      total_colaboradores: parseInt(r.total_colaboradores),
    })),
    charts: {
      empresasPorSegmento: empresasPorSegmentoRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      empresasPorPlano: empresasPorPlanoRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      empresasPorStatus: empresasPorStatusRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      vagasPorStatus: vagasPorStatusRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      candidatosPorStatus: candidatosPorStatus.map((r: { name: string; value: string }) => ({ name: r.name, value: parseInt(r.value) })),
      colaboradoresPorStatus: colaboradoresPorStatusRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      usuariosPorRole: usuariosPorRoleRes.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      crescimentoMensal: crescimentoMensalRes.rows.map(r => ({ mes: r.mes, empresas: parseInt(r.empresas) })),
    },
    atividadeRecente: atividadeRecenteRes.rows,
  })
}
