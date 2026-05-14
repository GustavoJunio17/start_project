import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowedRoles = ['admin', 'gestor_rh', 'super_admin', 'super_gestor']
  if (!allowedRoles.includes(user.role)) {
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
      criar_conta,
      email_conta,
      senha_conta,
    } = body

    if (!candidatura_id || !nome || !email) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (criar_conta && senha_conta) {
      if (
        senha_conta.length < 8 ||
        !/[A-Z]/.test(senha_conta) ||
        !/[a-z]/.test(senha_conta) ||
        !/[0-9]/.test(senha_conta)
      ) {
        return NextResponse.json(
          { error: 'Senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número' },
          { status: 400 }
        )
      }
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      let userId: string | null = null

      if (criar_conta && email_conta && senha_conta) {
        const accountEmail = email_conta.trim().toLowerCase()

        const { rows: existing } = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [accountEmail]
        )

        if (existing.length > 0) {
          await client.query('ROLLBACK')
          return NextResponse.json(
            { error: 'Este email já está cadastrado. Use outro email para a conta de colaborador.' },
            { status: 409 }
          )
        }

        const passwordHash = await bcrypt.hash(senha_conta, 10)
        const { rows: userRows } = await client.query(
          `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id)
           VALUES ($1, $2, $3, 'colaborador'::role_type, $4)
           RETURNING id`,
          [accountEmail, passwordHash, nome, user.empresa_id]
        )
        userId = userRows[0].id
      }

      // 1. Atualizar status da candidatura para "contratado"
      await client.query(
        `UPDATE candidaturas SET status = 'contratado' WHERE id = $1`,
        [candidatura_id]
      )
      const candidatoId = candidato_id ?? null

      // 2. Criar colaborador
      const colaboradorRes = await client.query(
        `INSERT INTO colaboradores (
          empresa_id,
          user_id,
          candidato_id,
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          user.empresa_id,
          userId,
          candidatoId,
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

      await client.query('COMMIT')

      return NextResponse.json(
        {
          success: true,
          colaborador_id: colaboradorId,
          user_id: userId,
          conta_criada: !!userId,
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
