'use client'

import { useState } from 'react'
import { getHomePath } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Erro ${res.status}`)
        setLoading(false)
        return
      }

      // Hard redirect so the browser sends the newly-set cookie on the next request.
      // router.push() can miss the cookie in Next.js App Router RSC cache.
      const destination = data.data?.role ? getHomePath(data.data.role) : '/redirect'
      window.location.href = destination
    } catch {
      setError('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background-color: #0A0E27;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0A0E27;
        }
        .card {
          margin: 0 auto;
          width: 100%;
          max-width: 420px;
          background: #111633;
          border: 1px solid #1e2a5e;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        h1 {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 12px;
          background: linear-gradient(to right, #00D4FF, #0066FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .subtitle {
          text-align: center;
          color: #7a8aaa;
          font-size: 15px;
          margin-bottom: 35px;
          font-weight: 400;
        }
        .form-group {
          margin-bottom: 18px;
        }
        label {
          display: block;
          margin-bottom: 10px;
          font-weight: 500;
          font-size: 15px;
          color: #e0e7ff;
        }
        input {
          width: 100%;
          padding: 12px 14px;
          background: #0A0E27;
          border: 1px solid #1e2a5e;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        input::placeholder {
          color: #525c7a;
        }
        input:focus {
          outline: none;
          border-color: #00D4FF;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
          background: #0f1428;
        }
        button {
          width: 100%;
          padding: 12px 16px;
          margin-top: 18px;
          background: linear-gradient(to right, #00D4FF, #0099FF);
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        button:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
        }
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error {
          color: #ff6b6b;
          font-size: 14px;
          margin-top: 18px;
          text-align: center;
          padding: 10px;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 6px;
          border-left: 3px solid #ff6b6b;
        }
        .links {
          margin-top: 28px;
          font-size: 13px;
          text-align: center;
        }
        .links p {
          margin: 8px 0;
          color: #a0aec0;
        }
        a {
          color: #00D4FF;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        a:hover {
          color: #00e5ff;
          text-decoration: underline;
        }
      `}</style>

      <div className="container">
        <div className="card">
          <h1>START PRO 5.0</h1>
          <p className="subtitle">Recrutamento, Treinamento e Desenvolvimento</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          <div className="links">
            <p>Candidato? <a href="/auth/register">Cadastre-se</a></p>
            <p><a href="/auth/forgot-password">Esqueceu a senha?</a></p>
            <p>Super Admin? <a href="/setup-admin">Setup</a></p>
          </div>
        </div>
      </div>
    </>
  )
}
