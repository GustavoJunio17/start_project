import { NextRequest, NextResponse } from 'next/server'
import { requireRole, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(['candidato'])

  const formData = await request.formData()
  const vagaId = formData.get('vaga_id') as string
  const telefone = formData.get('telefone') as string
  const linkedin = formData.get('linkedin') as string
  const pretensaoSalarial = formData.get('pretensao_salarial') as string
  const mensagem = formData.get('mensagem') as string
  const curriculoFile = formData.get('curriculo') as File

  if (!vagaId || !telefone || !curriculoFile) {
    return NextResponse.json(
      { error: 'Campos obrigatórios ausentes' },
      { status: 400 }
    )
  }

  const { rows: vagaRows } = await pool.query(
    'SELECT id FROM vagas WHERE id = $1 AND status = $2',
    [vagaId, 'aberta']
  )

  if (vagaRows.length === 0) {
    return NextResponse.json(
      { error: 'Vaga não encontrada ou não está aberta' },
      { status: 404 }
    )
  }

  const { rows: existing } = await pool.query(
    'SELECT id FROM candidaturas WHERE vaga_id = $1 AND email = $2',
    [vagaId, user.email]
  )

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'Você já enviou uma candidatura para esta vaga' },
      { status: 409 }
    )
  }

  const buffer = await curriculoFile.arrayBuffer()
  const curriculoData = Buffer.from(buffer)
  const curriculoOriginalName = curriculoFile.name

  const { rows } = await pool.query(
    `INSERT INTO candidaturas (
      vaga_id,
      nome,
      email,
      telefone,
      linkedin,
      pretensao_salarial,
      mensagem,
      curriculo,
      curriculo_nome,
      status,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING id`,
    [
      vagaId,
      user.nome_completo,
      user.email,
      telefone,
      linkedin || null,
      pretensaoSalarial || null,
      mensagem || null,
      curriculoData,
      curriculoOriginalName,
      'pendente',
    ]
  )

  return NextResponse.json(
    { id: rows[0].id, message: 'Candidatura enviada com sucesso' },
    { status: 201 }
  )
})
