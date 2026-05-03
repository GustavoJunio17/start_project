import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { requireRole } from '@/lib/auth/api-helpers'

export async function POST(request: NextRequest) {
  let authUser
  try {
    authUser = await requireRole(['super_admin', 'super_gestor', 'admin', 'gestor_rh'])
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
  }

  const client = await pool.connect()
  try {
    const data = await request.json()
    const { nome, email, senha, cpf, data_nascimento, setor, cargo, telefone, role, empresa_id } = data

    if (!nome || !email) {
      return NextResponse.json({ error: 'Campos obrigatorios: nome e e-mail' }, { status: 400 })
    }

    // Non-super roles are scoped to their own empresa
    const isSuperRole = ['super_admin', 'super_gestor'].includes(authUser.role)
    const targetEmpresaId = isSuperRole ? (empresa_id || authUser.empresa_id) : authUser.empresa_id
    if (!targetEmpresaId) {
      return NextResponse.json({ error: 'empresa_id obrigatorio' }, { status: 400 })
    }

    if (senha) {
      if (
        senha.length < 8 ||
        !/[A-Z]/.test(senha) ||
        !/[a-z]/.test(senha) ||
        !/[0-9]/.test(senha)
      ) {
        return NextResponse.json(
          { error: 'Senha deve ter no minimo 8 caracteres, uma maiuscula, uma minuscula e um numero' },
          { status: 400 },
        )
      }
    }

    await client.query('BEGIN')

    const { rows: users } = await client.query('SELECT id FROM users WHERE email = $1', [email])
    let userId = users.length > 0 ? users[0].id : null

    if (userId) {
      const { rows: existingColabs } = await client.query(
        'SELECT id FROM colaboradores WHERE user_id = $1 AND empresa_id = $2',
        [userId, targetEmpresaId],
      )
      if (existingColabs.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'E-mail ja cadastrado e vinculado a um colaborador' }, { status: 409 })
      }
      if (senha) {
        const hash = await bcrypt.hash(senha, 10)
        await client.query(
          'UPDATE users SET password_hash = $1, nome_completo = $2, role = $3::role_type, empresa_id = $4, telefone = $5 WHERE id = $6',
          [hash, nome, role || 'colaborador', targetEmpresaId, telefone || null, userId],
        )
      }
    } else if (senha) {
      const hash = await bcrypt.hash(senha, 10)
      const { rows: newUsers } = await client.query(
        `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone)
         VALUES ($1, $2, $3, $4::role_type, $5, $6)
         RETURNING id`,
        [email, hash, nome, role || 'colaborador', targetEmpresaId, telefone || null],
      )
      userId = newUsers[0].id
    }

    const { rows: colaboradores } = await client.query(
      `INSERT INTO colaboradores
        (user_id, empresa_id, nome, cpf, data_nascimento, setor, cargo, email, telefone, data_contratacao, origem, status, proxima_reavaliacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        userId,
        targetEmpresaId,
        nome,
        cpf || null,
        data_nascimento || null,
        setor || null,
        cargo || null,
        email,
        telefone || null,
        new Date().toISOString().split('T')[0],
        'contratacao_direta',
        'ativo',
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ],
    )

    await client.query('COMMIT')
    return NextResponse.json({ data: colaboradores[0], error: null })
  } catch (err) {
    await client.query('ROLLBACK')
    return NextResponse.json(
      { data: null, error: { message: err instanceof Error ? err.message : 'Erro interno do servidor' } },
      { status: 500 },
    )
  } finally {
    client.release()
  }
}
