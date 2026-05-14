import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { candidatura_id, candidato_id, data_hora, tipo, link_reuniao, endereco, observacoes } = body

  if (!data_hora) return NextResponse.json({ error: 'data_hora obrigatório' }, { status: 400 })
  if (!candidatura_id && !candidato_id) {
    return NextResponse.json({ error: 'candidatura_id ou candidato_id obrigatório' }, { status: 400 })
  }
  if (!['online', 'presencial'].includes(tipo || 'online')) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  try {
    if (candidatura_id) {
      const check = await pool.query(
        `SELECT c.id FROM candidaturas c JOIN vagas v ON c.vaga_id = v.id
         WHERE c.id = $1 AND v.empresa_id = $2`,
        [candidatura_id, user.empresa_id],
      )
      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
      }
    } else {
      const check = await pool.query(
        `SELECT id FROM candidatos WHERE id = $1 AND empresa_id = $2`,
        [candidato_id, user.empresa_id],
      )
      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 })
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO agendamentos
        (candidatura_id, candidato_id, empresa_id, gestor_responsavel_id, data_hora, tipo, link_reuniao, endereco, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        candidatura_id || null,
        candidato_id || null,
        user.empresa_id,
        user.id,
        data_hora,
        tipo || 'online',
        link_reuniao || null,
        endereco || null,
        observacoes || null,
      ],
    )
    return NextResponse.json({ success: true, agendamento: rows[0] })
  } catch (e) {
    console.error('Erro ao criar agendamento:', e)
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const candidatura_id = searchParams.get('candidatura_id')
  const candidato_id = searchParams.get('candidato_id')

  if (!candidatura_id && !candidato_id) {
    return NextResponse.json({ error: 'Informe candidatura_id ou candidato_id' }, { status: 400 })
  }

  try {
    const filterCol = candidatura_id ? 'candidatura_id' : 'candidato_id'
    const filterVal = candidatura_id || candidato_id
    const { rows } = await pool.query(
      `SELECT a.*, u.nome_completo AS gestor_nome
       FROM agendamentos a
       LEFT JOIN users u ON u.id = a.gestor_responsavel_id
       WHERE a.${filterCol} = $1 AND a.empresa_id = $2
       ORDER BY a.data_hora DESC`,
      [filterVal, user.empresa_id],
    )
    return NextResponse.json(rows)
  } catch (e) {
    console.error('Erro ao listar agendamentos:', e)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getServerUser()
  if (!user?.empresa_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  try {
    const { rows } = await pool.query(
      `DELETE FROM agendamentos WHERE id = $1 AND empresa_id = $2 RETURNING id`,
      [id, user.empresa_id],
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erro ao deletar agendamento:', e)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
