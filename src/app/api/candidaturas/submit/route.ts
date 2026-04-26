import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const vagaId = formData.get('vaga_id') as string
    const nome = formData.get('nome') as string
    const email = formData.get('email') as string
    const telefone = formData.get('telefone') as string
    const linkedin = formData.get('linkedin') as string
    const pretensaoSalarial = formData.get('pretensao_salarial') as string
    const mensagem = formData.get('mensagem') as string
    const curriculoFile = formData.get('curriculo') as File

    if (!vagaId || !nome || !email || !telefone || !curriculoFile) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      )
    }

    // Verificar se a vaga existe e está aberta
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

    // Converter arquivo para buffer
    const buffer = await curriculoFile.arrayBuffer()
    const curriculoData = Buffer.from(buffer)
    const curriculoOriginalName = curriculoFile.name

    // Inserir candidatura
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
        nome,
        email,
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
  } catch (error) {
    console.error('Erro ao processar candidatura:', error)
    return NextResponse.json(
      { error: 'Erro ao processar candidatura' },
      { status: 500 }
    )
  }
}
