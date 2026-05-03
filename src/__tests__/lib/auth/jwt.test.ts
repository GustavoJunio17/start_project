import { signToken, verifyToken, COOKIE_OPTIONS, JwtPayload } from '@/lib/auth/jwt'

const mockPayload: JwtPayload = {
  userId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  role: 'admin',
}

describe('JWT - signToken', () => {
  it('gera um token JWT válido', () => {
    const token = signToken(mockPayload)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('tokens de payloads diferentes são distintos', () => {
    const t1 = signToken(mockPayload)
    const t2 = signToken({ ...mockPayload, email: 'other@example.com' })
    expect(t1).not.toBe(t2)
  })
})

describe('JWT - verifyToken', () => {
  it('verifica e retorna o payload de um token válido', () => {
    const token = signToken(mockPayload)
    const result = verifyToken(token)
    expect(result).not.toBeNull()
    expect(result?.userId).toBe(mockPayload.userId)
    expect(result?.email).toBe(mockPayload.email)
    expect(result?.role).toBe(mockPayload.role)
  })

  it('retorna null para token inválido', () => {
    expect(verifyToken('token.invalido.aqui')).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(verifyToken('')).toBeNull()
  })

  it('retorna null para token adulterado', () => {
    const token = signToken(mockPayload)
    const parts = token.split('.')
    parts[1] = Buffer.from(JSON.stringify({ userId: 'hacker', email: 'hacker@x.com', role: 'super_admin' })).toString('base64')
    expect(verifyToken(parts.join('.'))).toBeNull()
  })
})

describe('COOKIE_OPTIONS', () => {
  it('cookie é httpOnly', () => {
    expect(COOKIE_OPTIONS.httpOnly).toBe(true)
  })

  it('cookie tem sameSite lax', () => {
    expect(COOKIE_OPTIONS.sameSite).toBe('lax')
  })

  it('cookie expira em 7 dias', () => {
    expect(COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24 * 7)
  })

  it('cookie secure é false em ambiente de test (não produção)', () => {
    // NODE_ENV=test, portanto secure deve ser false
    expect(COOKIE_OPTIONS.secure).toBe(false)
  })
})
