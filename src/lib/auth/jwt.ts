import jwt from 'jsonwebtoken'

const isProduction = process.env.NODE_ENV === 'production'
const SECRET = process.env.JWT_SECRET || (isProduction ? '' : 'dev-secret-change-in-production')

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production')
}

const EXPIRES_IN = '7d'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload
  } catch {
    return null
  }
}

export const AUTH_COOKIE = 'auth_token'
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
