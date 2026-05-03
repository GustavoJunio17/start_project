'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, AlertCircle, CheckCircle, Lock } from 'lucide-react'

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
    if (!token) setError('Token não encontrado. Use o link enviado por e-mail.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('As senhas não conferem')
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
          <h1 className="text-2xl font-bold text-white">Nova Senha</h1>
          <p className="text-gray-400 text-sm mt-2">Escolha uma nova senha segura para sua conta.</p>
        </div>

        {/* Form card */}
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-2xl p-8">
          {success ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-[#10B981]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Senha redefinida!</h3>
              <p className="text-gray-400 text-sm">Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nova Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading || !token}
                  minLength={8}
                  className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
                />
                <p className="text-xs text-gray-500 mt-1.5">Mínimo 8 caracteres, uma maiúscula, uma minúscula e um número.</p>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirmar Senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  disabled={loading || !token}
                  className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Redefinir Senha
                  </>
                )}
              </button>
            </form>
          )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
