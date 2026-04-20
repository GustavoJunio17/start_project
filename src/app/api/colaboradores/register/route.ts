import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const data = await request.json()
    const { 
      nome, email, senha, cpf, data_nascimento, 
      setor, cargo, telefone, role, empresa_id 
    } = data

    if (!nome || !email || !empresa_id) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes: nome, e-mail e empresa' }, { status: 400 })
    }

    await client.query('BEGIN')

    // 1. Check if user already exists
    const { rows: users } = await client.query('SELECT id FROM users WHERE email = $1', [email])
    let userId = users.length > 0 ? users[0].id : null

    if (userId) {
      // Check if this user is already linked to a colaborador
      const { rows: existingColabs } = await client.query('SELECT id FROM colaboradores WHERE user_id = $1', [userId])
      if (existingColabs.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'E-mail já cadastrado e vinculado a um colaborador' }, { status: 409 })
      }
      // If user exists but no colab, we reuse it (and potentially update password/role if provided)
      if (senha) {
        const hash = await bcrypt.hash(senha, 10)
        await client.query(
          'UPDATE users SET password_hash = $1, nome_completo = $2, role = $3::role_type, empresa_id = $4, telefone = $5 WHERE id = $6',
          [hash, nome, role || 'colaborador', empresa_id, telefone || null, userId]
        )
      }
    } else if (senha) {
      // Create new user if password provided and user doesn't exist
      if (senha.length < 6) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, { status: 400 })
      }
      const hash = await bcrypt.hash(senha, 10)
      const { rows: newUsers } = await client.query(
        `INSERT INTO users (email, password_hash, nome_completo, role, empresa_id, telefone)
         VALUES ($1, $2, $3, $4::role_type, $5, $6)
         RETURNING id`,
        [email, hash, nome, role || 'colaborador', empresa_id, telefone || null]
      )
      userId = newUsers[0].id
    }

    // 2. Create Colaborador record
    const { rows: colaboradores } = await client.query(
      `INSERT INTO colaboradores 
        (user_id, empresa_id, nome, cpf, data_nascimento, setor, cargo, email, telefone, role, data_contratacao, origem, status, proxima_reavaliacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::role_type, $11, $12, $13, $14)
       RETURNING *`,
      [
        userId,
        empresa_id,
        nome,
        cpf || null,
        data_nascimento || null,
        setor || null,
        cargo || null,
        email,
        telefone || null,
        role || 'colaborador',
        new Date().toISOString().split('T')[0],
        'contratacao_direta',
        'ativo',
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ]
    )

    await client.query('COMMIT')
    return NextResponse.json({ data: colaboradores[0], error: null })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error in colaborador registration:', err)
    return NextResponse.json({ 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Erro interno do servidor' } 
    }, { status: 500 })
  } finally {
    client.release()
  }
}
