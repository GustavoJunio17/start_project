import { cookies } from 'next/headers'
import { AUTH_COOKIE, verifyToken, type JwtPayload } from './jwt'
import pool from '../db/pool'

/**
 * Get the current authenticated user from the JWT cookie (server-side only).
 * Returns the full user profile or null.
 */
export async function getServerUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value

    if (!token) {
      console.log('[getServerUser] No token found in cookies')
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      console.log('[getServerUser] Invalid token')
      return null
    }

    const { rows } = await pool.query(
      'SELECT id, email, nome_completo, role, empresa_id, empresa_nome, permissoes, avatar_url, telefone, tema_preferido, ativo, created_at, updated_at, ultimo_login FROM users WHERE id = $1 AND ativo = true',
      [payload.userId],
    )

    return rows[0] ?? null
  } catch (error) {
    console.error('[getServerUser] Error:', error)
    return null
  }
}

/**
 * Get just the JWT payload without a DB roundtrip (server-side).
 */
export async function getServerSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
