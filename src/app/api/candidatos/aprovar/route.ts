import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'user_empresa') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      candidatura_id,
      candidato_id,
      nome,
      email,
      data_contratacao,
      departamento,
      cargo,
      modelo_trabalho,
      regime_contrato,
      salario,
    } = body

    if (!candidatura_id || !candidato_id || !nome || !email) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // 1. Atualizar status da candidatura para "contratado"
      await client.query(
        `UPDATE candidaturas
         SET status = 'contratado'
         WHERE id = $1`,
        [candidatura_id]
      )

      // 2. Criar colaborador
      const colaboradorRes = await client.query(
        `INSERT INTO colaboradores (
          empresa_id,
          nome,
          email,
          data_contratacao,
          departamento,
          cargo,
          modelo_trabalho,
          regime_contrato,
          salario,
          origem,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          user.empresa_id,
          nome,
          email,
          data_contratacao || new Date().toISOString().split('T')[0],
          departamento || null,
          cargo || null,
          modelo_trabalho || 'presencial',
          regime_contrato || 'CLT',
          salario ? parseFloat(salario) : null,
          'conversao_candidato',
          'ativo',
        ]
      )

      const colaboradorId = colaboradorRes.rows[0].id

      // 3. Atualizar candidato com perfil_disc e link para colaborador (se necessário)
      // Você pode adicionar lógica adicional aqui se precisar

      await client.query('COMMIT')

      return NextResponse.json(
        {
          success: true,
          colaborador_id: colaboradorId,
          message: 'Candidato aprovado e cadastrado como colaborador com sucesso',
        },
        { status: 201 }
      )
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Erro ao aprovar candidato:', error)
    return NextResponse.json(
      { error: 'Erro ao processar aprovação' },
      { status: 500 }
    )
  }
}
