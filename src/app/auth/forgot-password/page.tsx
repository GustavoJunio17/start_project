'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [devLink, setDevLink] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setDevLink('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao processar solicitacao')
      } else {
        setMessage(data.message)
        if (data.resetUrl) setDevLink(data.resetUrl)
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
        .subtitle { text-align: center; color: #7a8aaa; font-size: 14px; margin-bottom: 30px; line-height: 1.5; }
        .form-group { margin-bottom: 18px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; color: #e0e7ff; }
        input { width: 100%; padding: 12px 14px; background: #0A0E27; border: 1px solid #1e2a5e; border-radius: 8px; color: #fff; font-size: 14px; transition: all 0.2s; }
        input:focus { outline: none; border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
        button { width: 100%; padding: 12px; margin-top: 8px; background: linear-gradient(to right, #00D4FF, #0099FF); color: #000; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .message { margin-top: 16px; padding: 12px; background: #0d2d1a; border: 1px solid #1a5c35; border-radius: 8px; color: #4ade80; font-size: 14px; text-align: center; }
        .error { margin-top: 16px; padding: 12px; background: #2d0d0d; border: 1px solid #5c1a1a; border-radius: 8px; color: #f87171; font-size: 14px; text-align: center; }
        .dev-link { margin-top: 12px; padding: 10px 12px; background: #1a1a2e; border: 1px solid #333; border-radius: 8px; font-size: 12px; color: #00D4FF; word-break: break-all; }
        .dev-label { color: #7a8aaa; font-size: 11px; margin-bottom: 4px; }
        .back-link { text-align: center; margin-top: 20px; font-size: 14px; color: #7a8aaa; }
        .back-link a { color: #00D4FF; text-decoration: none; }
      `}</style>
      <div className="container">
        <div className="card">
          <h1>Redefinir Senha</h1>
          <p className="subtitle">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Redefinicao'}
            </button>
          </form>
          {message && (
            <div className="message">
              {message}
              {devLink && (
                <div className="dev-link">
                  <div className="dev-label">DEV — Link de reset:</div>
                  <a href={devLink} style={{ color: '#00D4FF' }}>{devLink}</a>
                </div>
              )}
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <div className="back-link">
            <a href="/auth/login">← Voltar ao login</a>
          </div>
        </div>
      </div>
    </>
  )
}
