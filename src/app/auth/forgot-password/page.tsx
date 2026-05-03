'use client'

import { useState } from 'react'
import { Zap, AlertCircle, CheckCircle, Mail } from 'lucide-react'

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
        setError(data.error || 'Erro ao processar solicitação')
      } else {
        setMessage(data.message)
        if (data.resetUrl) setDevLink(data.resetUrl)
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center shadow-lg shadow-[#00D4FF]/20">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">START <span className="text-[#00D4FF]">PRO</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
          <p className="text-gray-400 text-sm mt-2">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981] text-sm">
                <CheckCircle size={15} className="shrink-0 mt-0.5" />
                <div>
                  <span>{message}</span>
                  {devLink && (
                    <div className="mt-3 p-2.5 bg-[#0A0E27] border border-[#1e2a5e] rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">DEV — Link de reset:</p>
                      <a href={devLink} className="text-[#00D4FF] text-xs break-all hover:underline">{devLink}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail size={15} />
                  Enviar Link de Redefinição
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <a href="/auth/login" className="text-[#00D4FF] hover:text-[#00D4FF]/80 font-medium transition-colors">
            ← Voltar ao login
          </a>
        </div>
      </div>
    </div>
  )
}
