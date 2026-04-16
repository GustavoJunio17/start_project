import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { nome_completo, role, password, ativo } = await request.json()

    // Base query array and values
    const queryParts = []
    const values: any[] = []
    let paramIndex = 1

    if (nome_completo !== undefined) {
      queryParts.push(`nome_completo = $${paramIndex++}`)
      values.push(nome_completo)
    }

    if (role !== undefined) {
      queryParts.push(`role = $${paramIndex++}::role_type`)
      values.push(role)
    }

    if (ativo !== undefined) {
      queryParts.push(`ativo = $${paramIndex++}`)
      values.push(ativo)
    }

    // Se enviou uma nova senha (não vazia)
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      queryParts.push(`password_hash = $${paramIndex++}`)
      values.push(passwordHash)
    }

    if (queryParts.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar' }, { status: 400 })
    }

    values.push(id)
    const updateQuery = `
      UPDATE users 
      SET ${queryParts.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING id, email, nome_completo, role, ativo
    `

    const { rows } = await pool.query(updateQuery, values)
    
    if (rows.length === 0) {
       return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user: rows[0], message: 'Usuário atualizado com sucesso' })
  } catch (error) {
    console.error('[admin/usuarios/PUT] failed to update user', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar usuário' }, { status: 500 })
  }
}
