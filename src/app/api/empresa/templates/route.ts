import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { rows } = await pool.query(
      `SELECT id, nome, descricao FROM templates_testes
       WHERE empresa_id = $1
       ORDER BY created_at DESC`,
      [user.empresa_id]
    )
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { nome, descricao, questoes } = await request.json()

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (!Array.isArray(questoes) || questoes.length === 0) {
      return NextResponse.json({ error: 'Questões obrigatórias' }, { status: 400 })
    }

    const questoesIds: string[] = []

    for (const questao of questoes) {
      const { rows } = await pool.query(
        `INSERT INTO questoes_disc (id, empresa_id, pergunta, opcoes)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          randomUUID(),
          user.empresa_id,
          questao.pergunta,
          JSON.stringify([
            { texto: questao.opcao_d, dimensao: 'D' },
            { texto: questao.opcao_i, dimensao: 'I' },
            { texto: questao.opcao_s, dimensao: 'S' },
            { texto: questao.opcao_c, dimensao: 'C' },
          ]),
        ]
      )
      questoesIds.push(rows[0].id)
    }

    const { rows: [template] } = await pool.query(
      `INSERT INTO templates_testes (id, empresa_id, nome, descricao, questoes_ids)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [randomUUID(), user.empresa_id, nome, descricao || null, questoesIds]
    )

    return NextResponse.json({ id: template.id }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar template:', error?.message ?? error)
    return NextResponse.json({ error: error?.message ?? 'Erro ao criar template' }, { status: 500 })
  }
}
