'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, AlertCircle } from 'lucide-react'
import { maskPhone, validatePassword } from '@/lib/utils/masks'
import { PasswordStrength } from '@/components/ui/PasswordStrength'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefone, setTelefone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conviteToken = searchParams.get('token')
  const redirectTo = searchParams.get('redirect')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { valid } = validatePassword(password)
    if (!valid) {
      setError('A senha não atende aos requisitos de segurança')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password, telefone: telefone.replace(/\D/g, ''), conviteToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      const safeRedirect =
        redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : null
      router.push(safeRedirect || '/redirect')
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
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
          <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
          <p className="text-gray-400 text-sm mt-2">
            {conviteToken ? 'Complete seu cadastro via convite' : 'Cadastre-se como candidato'}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1.5">
                Nome Completo
              </label>
              <input
                id="nome"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-1.5">
                WhatsApp
              </label>
              <input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                disabled={loading}
                inputMode="numeric"
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/15 transition-colors disabled:opacity-60"
              />
              <PasswordStrength password={password} />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </>
              ) : 'Criar Conta'}
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Já tem uma conta?{' '}
            <Link
              href={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : '/auth/login'}
              className="text-[#00D4FF] hover:text-[#00D4FF]/80 font-medium transition-colors"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
