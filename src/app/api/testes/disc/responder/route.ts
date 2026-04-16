import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { candidato_id, respostas, resultado, score, duracao_segundos } = body

  if (!candidato_id || !respostas) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // Verify ownership
  const { rows: candidatos } = await pool.query(
    'SELECT id, user_id, empresa_id, vaga_id, data_ultimo_teste FROM candidatos WHERE id = $1',
    [candidato_id],
  )

  const candidato = candidatos[0]
  if (!candidato) {
    return NextResponse.json({ error: 'Candidato nao encontrado' }, { status: 404 })
  }

  if (candidato.user_id !== user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  // Check 12-month restriction
  if (candidato.data_ultimo_teste) {
    const monthsSince = (Date.now() - new Date(candidato.data_ultimo_teste).getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsSince < 12) {
      return NextResponse.json({ error: 'Voce ja realizou um teste nesta empresa nos ultimos 12 meses' }, { status: 400 })
    }
  }

  // Save response
  await pool.query(
    'INSERT INTO respostas_teste (candidato_id, tipo, respostas, resultado, score, duracao_segundos) VALUES ($1, $2, $3, $4, $5, $6)',
    [candidato_id, 'disc', JSON.stringify(respostas), JSON.stringify(resultado), score, duracao_segundos],
  )

  // Calculate match score and classification
  let matchScore = null
  let classificacao = null

  if (resultado && candidato.vaga_id) {
    const { rows: vagas } = await pool.query(
      'SELECT perfil_disc_ideal FROM vagas WHERE id = $1',
      [candidato.vaga_id],
    )

    if (vagas[0]?.perfil_disc_ideal) {
      const ideal = vagas[0].perfil_disc_ideal as Record<string, number>
      const diffs = ['D', 'I', 'S', 'C'].map(k =>
        Math.abs((resultado[k] || 0) - (ideal[k] || 0))
      )
      matchScore = Math.max(0, Math.round(100 - diffs.reduce((a, b) => a + b, 0) / 4))
      classificacao = matchScore >= 85 ? 'ouro' : matchScore >= 70 ? 'prata' : matchScore >= 50 ? 'bronze' : null
    }
  }

  // Update candidato
  await pool.query(
    `UPDATE candidatos SET perfil_disc = $1, match_score = $2, classificacao = $3::classificacao_type,
     status_candidatura = 'em_avaliacao', data_ultimo_teste = $4 WHERE id = $5`,
    [JSON.stringify(resultado), matchScore, classificacao, new Date().toISOString().split('T')[0], candidato_id],
  )

  return NextResponse.json({ success: true, matchScore, classificacao })
}
