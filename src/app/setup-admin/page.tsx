'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { validatePassword } from '@/lib/utils/masks'
import { PasswordStrength } from '@/components/ui/PasswordStrength'

type SetupAdminResponse = {
  error?: string
  user?: {
    role: string
    email: string
  }
}

function parseJsonSafely<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export default function SetupAdminPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'super_admin' | 'super_gestor' | 'admin'>('super_admin')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { valid } = validatePassword(password)
    if (!valid) {
      setError('A senha não atende aos requisitos de segurança')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password, role, secret }),
      })

      const rawBody = await res.text()
      const data = rawBody ? parseJsonSafely<SetupAdminResponse>(rawBody) : null

      if (!res.ok) {
        setError(data?.error || 'Nao foi possivel criar a conta administrativa')
        return
      }

      if (!data?.user) {
        setError('Resposta inesperada do servidor')
        return
      }

      setSuccess(`Conta ${data.user.role} criada com sucesso para ${data.user.email}`)
      setNome('')
      setEmail('')
      setPassword('')
      setSecret('')
    } catch {
      setError('Erro de conexao com o servidor. Verifique o backend e tente novamente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E27] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Setup Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Pagina restrita para criacao de contas administrativas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#111633] p-6 rounded-xl border border-[#1e2a5e]">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Codigo Secreto</label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E27] border border-[#1e2a5e] text-white text-sm focus:outline-none focus:border-[#00D4FF]"
              placeholder="Digite o codigo secreto"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'super_admin' | 'super_gestor' | 'admin')}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E27] border border-[#1e2a5e] text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            >
              <option value="super_admin">Super Admin</option>
              <option value="super_gestor">Super Gestor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E27] border border-[#1e2a5e] text-white text-sm focus:outline-none focus:border-[#00D4FF]"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E27] border border-[#1e2a5e] text-white text-sm focus:outline-none focus:border-[#00D4FF]"
              placeholder="admin@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E27] border border-[#1e2a5e] text-white text-sm focus:outline-none focus:border-[#00D4FF]"
              placeholder="Mínimo 8 caracteres"
            />
            <PasswordStrength password={password} />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Criando...' : 'Criar Conta Admin'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    </div>
  )
}
