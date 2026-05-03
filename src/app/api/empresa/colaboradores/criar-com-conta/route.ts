import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireRole, withErrorHandler, errorResponse } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(['admin', 'gestor_rh', 'super_admin', 'super_gestor'])

  const body = await request.json()
  const {
    nome,
    email,
    telefone,
    cpf,
    cargo,
    departamento,
    empresa_id,
    status,
    origem,
    data_contratacao,
    modelo_trabalho,
    regime_contrato,
    salario,
    hard_skills,
    escolaridade,
    criar_conta,
    email_conta,
    senha_conta,
  } = body

  if (!nome) {
    return errorResponse('Nome é obrigatório', 400)
  }

  const targetEmpresaId = empresa_id || user.empresa_id
  if (!targetEmpresaId) {
    return errorResponse('Empresa não identificada', 400)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    let userId: string | null = null

    if (criar_conta && email_conta && senha_conta) {
      if (senha_conta.length < 8 || !/[A-Z]/.test(senha_conta) || !/[a-z]/.test(senha_conta) || !/[0-9]/.test(senha_conta)) {
        await client.query('ROLLBACK')
        return errorResponse('Senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número', 400)
      }

      const { rows: existing } = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email_conta]
      )
      if (existing.length > 0) {
        await client.query('ROLLBACK')
        return errorResponse('Este email já está cadastrado. Use outro email para a conta de colaborador.', 409)
      }

      const passwordHash = await bcrypt.hash(senha_conta, 10)
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone)
         VALUES ($1, $2, $3, 'colaborador'::role_type, $4, $5)
         RETURNING id`,
        [email_conta, passwordHash, nome, targetEmpresaId, telefone || null]
      )
      userId = userRows[0].id
    }

    const skillsArray = Array.isArray(hard_skills)
      ? hard_skills
      : (typeof hard_skills === 'string' && hard_skills
          ? hard_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [])

    const { rows: colabRows } = await client.query(
      `INSERT INTO colaboradores (
        empresa_id, user_id, nome, email, telefone, cpf, cargo, departamento,
        status, origem, data_contratacao, modelo_trabalho, regime_contrato,
        salario, hard_skills, escolaridade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`,
      [
        targetEmpresaId,
        userId,
        nome,
        email || null,
        telefone || null,
        cpf || null,
        cargo || null,
        departamento || null,
        status || 'ativo',
        origem || 'contratacao_direta',
        data_contratacao || null,
        modelo_trabalho || null,
        regime_contrato || null,
        salario ? parseFloat(salario) : null,
        skillsArray,
        escolaridade || null,
      ]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      colaborador_id: colabRows[0].id,
      user_id: userId,
      conta_criada: !!userId,
    }, { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
