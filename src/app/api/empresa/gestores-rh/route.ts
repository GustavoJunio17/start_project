import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { nome_completo, email, telefone, senha, departamentos } = await request.json()

  if (!nome_completo || !email || !senha || !departamentos || departamentos.length === 0) {
    return NextResponse.json(
      { error: 'Nome, email, senha e pelo menos um departamento obrigatorios' },
      { status: 400 },
    )
  }

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

  const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email ja cadastrado' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(senha, 10)

  await pool.query('BEGIN')
  try {
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone, ativo)
       VALUES ($1, $2, $3, $4::role_type, $5, $6, true)
       RETURNING id`,
      [email, passwordHash, nome_completo, 'gestor_rh', user.empresa_id, telefone || null],
    )

    const userId = userRows[0].id

    for (const deptId of departamentos) {
      await pool.query(
        `INSERT INTO gestor_rh_setores (user_id, empresa_id, cargos_departamento_id)
         VALUES ($1, $2, $3)`,
        [userId, user.empresa_id, deptId],
      )
    }

    await pool.query('COMMIT')

    return NextResponse.json(
      {
        user: { id: userId, email, nome_completo, role: 'gestor_rh', empresa_id: user.empresa_id },
        message: 'Gestor RH criado com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  }
}

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.nome_completo, u.role, u.ativo, u.created_at, u.telefone,
            array_agg(json_build_object('id', cd.id, 'nome', cd.nome, 'tipo', cd.tipo)) FILTER (WHERE cd.id IS NOT NULL) as setores
     FROM users u
     LEFT JOIN gestor_rh_setores grs ON u.id = grs.user_id
     LEFT JOIN cargos_departamentos cd ON grs.cargos_departamento_id = cd.id
     WHERE u.empresa_id = $1 AND u.role = 'gestor_rh'
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [user.empresa_id],
  )

  return NextResponse.json(rows)
}

export async function PUT(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, nome_completo, email, telefone, senha, departamentos } = await request.json()

  if (!id || !nome_completo || !email || !departamentos || departamentos.length === 0) {
    return NextResponse.json(
      { error: 'ID, nome, email e pelo menos um departamento obrigatorios' },
      { status: 400 },
    )
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

  const { rows: existing } = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND id != $2',
    [email, id],
  )
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email ja cadastrado por outro usuario' }, { status: 409 })
  }

  await pool.query('BEGIN')
  try {
    const params: unknown[] = [id, nome_completo, email, telefone || null]
    const updateFields: string[] = ['nome_completo = $2', 'email = $3', 'telefone = $4', 'updated_at = NOW()']

    if (senha) {
      const passwordHash = await bcrypt.hash(senha, 10)
      params.push(passwordHash)
      updateFields.push(`password_hash = $${params.length}`)
    }

    params.push(user.empresa_id)
    const whereIdx = params.length

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $1 AND empresa_id = $${whereIdx}`,
      params,
    )

    await pool.query('DELETE FROM gestor_rh_setores WHERE user_id = $1', [id])

    for (const deptId of departamentos) {
      await pool.query(
        `INSERT INTO gestor_rh_setores (user_id, empresa_id, cargos_departamento_id)
         VALUES ($1, $2, $3)`,
        [id, user.empresa_id, deptId],
      )
    }

    await pool.query('COMMIT')

    return NextResponse.json({ message: 'Gestor RH atualizado com sucesso' })
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  }
}
