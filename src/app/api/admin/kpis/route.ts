import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import pool from '@/lib/db/pool'

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  if (!['super_admin', 'super_gestor', 'user_empresa'].includes(user.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const [empresas, users, candidatos, testes] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM empresas'),
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query('SELECT COUNT(*) FROM candidatos'),
    pool.query('SELECT COUNT(*) FROM respostas_teste'),
  ])

  return NextResponse.json({
    totalEmpresas: parseInt(empresas.rows[0].count),
    totalUsuarios: parseInt(users.rows[0].count),
    totalCandidatos: parseInt(candidatos.rows[0].count),
    totalTestes: parseInt(testes.rows[0].count),
  })
}
