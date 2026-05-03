import { NextRequest } from 'next/server'

jest.mock('@/lib/db/pool', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}))

import pool from '@/lib/db/pool'
const mockPool = pool as jest.Mocked<typeof pool>

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/setup-admin', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const VALID_SECRET = 'startpro-setup-2026' // default dev secret
const validBody = {
  nome: 'Super Admin',
  email: 'admin@startpro.com',
  password: 'AdminSenha1!',
  role: 'super_admin',
  secret: VALID_SECRET,
}

describe('POST /api/auth/setup-admin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 403 para secret inválido', async () => {
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest({ ...validBody, secret: 'secret-errado' })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('retorna 400 para campos obrigatórios ausentes', async () => {
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest({ secret: VALID_SECRET, nome: '', email: '', password: '', role: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 para role inválida', async () => {
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest({ ...validBody, role: 'candidato' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 para senha menor que 8 chars', async () => {
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest({ ...validBody, password: 'Ab1!' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 409 para email já cadastrado', async () => {
    mockPool.query = jest.fn().mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] })
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest(validBody)
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('cria super_admin com sucesso', async () => {
    mockPool.query = jest.fn()
      .mockResolvedValueOnce({ rows: [] }) // email check
      .mockResolvedValueOnce({ rows: [{ id: 'admin-uuid', email: validBody.email, nome_completo: validBody.nome, role: 'super_admin' }] }) // INSERT
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest(validBody)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.role).toBe('super_admin')
  })

  it('resposta não expõe password_hash', async () => {
    mockPool.query = jest.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'admin-uuid', email: validBody.email, nome_completo: validBody.nome, role: 'super_admin' }] })
    const { POST } = await import('@/app/api/auth/setup-admin/route')
    const req = makeRequest(validBody)
    const res = await POST(req)
    const body = await res.json()
    expect(body.user?.password_hash).toBeUndefined()
  })
})
