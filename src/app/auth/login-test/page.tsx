'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      console.log('Tentando fazer login...')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      
      const data = await res.json()
      console.log('Response:', data)
      
      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }
      
      console.log('Login sucesso, redirecionando...')
      router.push('/redirect')
    } catch (err) {
      console.error('Login error:', err)
      setError('Erro ao conectar')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#0A0E27',
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>START PRO - Login Teste</h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              placeholder="email@example.com"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#111633',
                border: '1px solid #1e2a5e',
                color: '#fff',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#111633',
                border: '1px solid #1e2a5e',
                color: '#fff',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#666' : '#00D4FF',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error && (
          <div style={{ color: '#ff6b6b', marginTop: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px' }}>
          <p>Teste simples para debug</p>
          <a href="/setup-admin" style={{ color: '#00D4FF' }}>Criar super admin</a>
        </div>
      </div>
    </div>
  )
}
