import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

/**
 * Convida um candidato do Banco de Talentos para uma nova vaga.
 * Cria uma nova candidatura com status 'pendente' reaproveitando dados do candidato.
 */
export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vaga_id, candidatura_origem_id, candidato_id, mensagem } = await request.json()

  if (!vaga_id) return NextResponse.json({ error: 'vaga_id obrigatório' }, { status: 400 })
  if (!candidatura_origem_id && !candidato_id) {
    return NextResponse.json({ error: 'candidatura_origem_id ou candidato_id obrigatório' }, { status: 400 })
  }

  try {
    const vagaCheck = await pool.query(
      `SELECT id FROM vagas WHERE id = $1 AND empresa_id = $2`,
      [vaga_id, user.empresa_id],
    )
    if (vagaCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 })
    }

    let dados: { nome: string; email: string; telefone: string; linkedin: string | null; pretensao_salarial: string | null }

    if (candidatura_origem_id) {
      const { rows } = await pool.query(
        `SELECT c.nome, c.email, c.telefone, c.linkedin, c.pretensao_salarial
         FROM candidaturas c JOIN vagas v ON c.vaga_id = v.id
         WHERE c.id = $1 AND v.empresa_id = $2`,
        [candidatura_origem_id, user.empresa_id],
      )
      if (rows.length === 0) return NextResponse.json({ error: 'Candidatura origem não encontrada' }, { status: 404 })
      dados = rows[0]
    } else {
      const { rows } = await pool.query(
        `SELECT nome_completo AS nome, email, whatsapp AS telefone
         FROM candidatos WHERE id = $1 AND empresa_id = $2`,
        [candidato_id, user.empresa_id],
      )
      if (rows.length === 0) return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 })
      dados = { ...rows[0], linkedin: null, pretensao_salarial: null }
    }

    const dup = await pool.query(
      `SELECT id FROM candidaturas WHERE vaga_id = $1 AND email = $2`,
      [vaga_id, dados.email],
    )
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'Candidato já possui candidatura para essa vaga' }, { status: 409 })
    }

    const { rows: nova } = await pool.query(
      `INSERT INTO candidaturas (vaga_id, nome, email, telefone, linkedin, pretensao_salarial, mensagem, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente')
       RETURNING *`,
      [
        vaga_id,
        dados.nome,
        dados.email,
        dados.telefone || '',
        dados.linkedin,
        dados.pretensao_salarial,
        mensagem || null,
      ],
    )

    return NextResponse.json({ success: true, candidatura: nova[0] })
  } catch (e) {
    console.error('Erro ao convidar para vaga:', e)
    return NextResponse.json({ error: 'Erro ao convidar candidato' }, { status: 500 })
  }
}
