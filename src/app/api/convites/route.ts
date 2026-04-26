import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import pool from '@/lib/db/pool'
import { requireRole } from '@/lib/auth/api-helpers'
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(`convites:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 hora.' }, { status: 429 })
  }

  let user
  try {
    user = await requireRole(['super_admin', 'super_gestor', 'user_empresa'])
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro'
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
  }

  const { email, role, empresa_id } = await request.json()

  if (!email || !role) {
    return NextResponse.json({ error: 'E-mail e role sao obrigatorios' }, { status: 400 })
  }

  const validRoles = ['user_empresa', 'gestor_rh', 'colaborador', 'candidato']
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `Role invalido. Use: ${validRoles.join(', ')}` }, { status: 400 })
  }

  // Non-super roles can only invite to their own empresa
  const isSuperRole = ['super_admin', 'super_gestor'].includes(user.role)
  const targetEmpresaId = isSuperRole ? (empresa_id || user.empresa_id) : user.empresa_id
  if (!targetEmpresaId) {
    return NextResponse.json({ error: 'empresa_id obrigatorio' }, { status: 400 })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await pool.query(
    `INSERT INTO convites (email, role, empresa_id, token, criado_por, expira_em)
     VALUES ($1, $2::role_type, $3, $4, $5, $6)
     ON CONFLICT (token) DO NOTHING`,
    [email, role, targetEmpresaId, token, user.id, expiresAt],
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/auth/register?token=${token}`

  return NextResponse.json({ token, inviteUrl, expiresAt })
}

export async function GET(request: NextRequest) {
  let user
  try {
    user = await requireRole(['super_admin', 'super_gestor', 'user_empresa'])
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro'
    if (msg === 'UNAUTHORIZED') return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
  }

  const isSuperRole = ['super_admin', 'super_gestor'].includes(user.role)
  const { rows } = isSuperRole
    ? await pool.query(`SELECT * FROM convites ORDER BY created_at DESC LIMIT 100`)
    : await pool.query(
        `SELECT * FROM convites WHERE empresa_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [user.empresa_id],
      )

  return NextResponse.json({ data: rows })
}
