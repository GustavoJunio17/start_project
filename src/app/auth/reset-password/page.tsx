'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) setError('Token nao encontrado. Use o link enviado por e-mail.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('As senhas nao conferem')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    } catch {
      setError('Erro de conexao')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        html, body { height: 100%; margin: 0; padding: 0; background-color: #0A0E27; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .container { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: #0A0E27; }
        .card { width: 100%; max-width: 420px; background: #111633; border: 1px solid #1e2a5e; border-radius: 12px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        h1 { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 10px; background: linear-gradient(to right, #00D4FF, #0066FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { text-align: center; color: #7a8aaa; font-size: 14px; margin-bottom: 30px; }
        .form-group { margin-bottom: 18px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; color: #e0e7ff; }
        input { width: 100%; padding: 12px 14px; background: #0A0E27; border: 1px solid #1e2a5e; border-radius: 8px; color: #fff; font-size: 14px; transition: all 0.2s; }
        input:focus { outline: none; border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
        .hint { font-size: 11px; color: #7a8aaa; margin-top: 6px; }
        button { width: 100%; padding: 12px; margin-top: 8px; background: linear-gradient(to right, #00D4FF, #0099FF); color: #000; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .success { margin-top: 16px; padding: 12px; background: #0d2d1a; border: 1px solid #1a5c35; border-radius: 8px; color: #4ade80; font-size: 14px; text-align: center; }
        .error { margin-top: 16px; padding: 12px; background: #2d0d0d; border: 1px solid #5c1a1a; border-radius: 8px; color: #f87171; font-size: 14px; text-align: center; }
        .back-link { text-align: center; margin-top: 20px; font-size: 14px; color: #7a8aaa; }
        .back-link a { color: #00D4FF; text-decoration: none; }
      `}</style>
      <div className="container">
        <div className="card">
          <h1>Nova Senha</h1>
          <p className="subtitle">Escolha uma nova senha segura para sua conta.</p>
          {success ? (
            <div className="success">
              Senha redefinida com sucesso! Redirecionando para o login...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">Nova Senha</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading || !token}
                  minLength={8}
                />
                <p className="hint">Minimo 8 caracteres, uma maiuscula, uma minuscula e um numero.</p>
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirmar Senha</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  disabled={loading || !token}
                />
              </div>
              <button type="submit" disabled={loading || !token}>
                {loading ? 'Salvando...' : 'Redefinir Senha'}
              </button>
              {error && <div className="error">{error}</div>}
            </form>
          )}
          <div className="back-link">
            <a href="/auth/login">← Voltar ao login</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
