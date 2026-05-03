import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit'

describe('checkRateLimit', () => {
  it('permite a primeira requisição', () => {
    const key = `test-key-${Date.now()}-1`
    expect(checkRateLimit(key, 5, 60_000)).toBe(true)
  })

  it('permite até o limite máximo de requisições', () => {
    const key = `test-key-${Date.now()}-2`
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000)).toBe(true)
    }
  })

  it('bloqueia após exceder o limite', () => {
    const key = `test-key-${Date.now()}-3`
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000)
    }
    expect(checkRateLimit(key, 5, 60_000)).toBe(false)
  })

  it('reseta após o período expirar', () => {
    const key = `test-key-${Date.now()}-4`
    // Usa janela de 1ms para simular expiração
    checkRateLimit(key, 1, 1)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Após expirar, deve permitir novamente
        expect(checkRateLimit(key, 1, 1)).toBe(true)
        resolve()
      }, 10)
    })
  })

  it('chaves diferentes são independentes', () => {
    const key1 = `test-key-${Date.now()}-5a`
    const key2 = `test-key-${Date.now()}-5b`
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key1, 5, 60_000)
    }
    // key1 está bloqueado, key2 deve ser independente
    expect(checkRateLimit(key1, 5, 60_000)).toBe(false)
    expect(checkRateLimit(key2, 5, 60_000)).toBe(true)
  })
})

describe('getClientIp', () => {
  const makeReq = (headers: Record<string, string>) => ({
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
  })

  it('extrai IP do header x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' })
    expect(getClientIp(req)).toBe('192.168.1.1')
  })

  it('extrai IP do header x-real-ip como fallback', () => {
    const req = makeReq({ 'x-real-ip': '10.10.10.10' })
    expect(getClientIp(req)).toBe('10.10.10.10')
  })

  it('retorna "unknown" quando nenhum header presente', () => {
    const req = makeReq({})
    expect(getClientIp(req)).toBe('unknown')
  })

  it('usa o primeiro IP da lista x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })
})
