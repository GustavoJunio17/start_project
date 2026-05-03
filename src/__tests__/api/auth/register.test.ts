import { NextRequest } from 'next/server'

jest.mock('@/lib/db/pool', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}))

jest.mock('@/lib/auth/rate-limit', () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}))

import pool from '@/lib/db/pool'
const mockPool = pool as jest.Mocked<typeof pool>

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validBody = {
  nome: 'Usuário Teste',
  email: 'novo@example.com',
  password: 'Senha123!',
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 400 quando campos obrigatórios ausentes', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest({ nome: '', email: '', password: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 para senha fraca (sem maiúscula)', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest({ ...validBody, password: 'senhafraca1' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('Senha')
  })

  it('retorna 400 para senha sem número', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest({ ...validBody, password: 'SenhaSemNumero' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 para senha menor que 8 chars', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest({ ...validBody, password: 'Ab1!' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 409 para email já cadastrado', async () => {
    mockPool.query = jest.fn().mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] })
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest(validBody)
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('cria usuário candidato quando sem convite', async () => {
    mockPool.query = jest.fn()
      .mockResolvedValueOnce({ rows: [] }) // email check
      .mockResolvedValueOnce({ rows: [{ id: 'new-uuid', email: validBody.email, nome_completo: validBody.nome, role: 'candidato', empresa_id: null }] }) // INSERT
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest(validBody)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.role).toBe('candidato')
    expect(body.user.email).toBe(validBody.email)
  })

  it('resposta não expõe password_hash', async () => {
    mockPool.query = jest.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'new-uuid', email: validBody.email, nome_completo: validBody.nome, role: 'candidato', empresa_id: null }] })
    const { POST } = await import('@/app/api/auth/register/route')
    const req = makeRequest(validBody)
    const res = await POST(req)
    const body = await res.json()
    expect(body.user?.password_hash).toBeUndefined()
  })
})
