'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E27]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" />
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password, telefone, conviteToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      router.push('/redirect')
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E27] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#0066FF] bg-clip-text text-transparent">
            START PRO 5.0
          </h1>
          <p className="text-gray-400 mt-2">Crie sua conta para comecar</p>
        </div>

        <Card className="bg-[#111633] border-[#1e2a5e]">
          <CardHeader>
            <CardTitle className="text-white">Cadastro</CardTitle>
            <CardDescription>
              {conviteToken ? 'Complete seu cadastro via convite' : 'Cadastre-se como candidato'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="bg-[#0A0E27] border-[#1e2a5e]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#0A0E27] border-[#1e2a5e]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">WhatsApp</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="bg-[#0A0E27] border-[#1e2a5e]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-[#0A0E27] border-[#1e2a5e]"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Ja tem uma conta?{' '}
              <Link href="/auth/login" className="text-[#00D4FF] hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
