import { createServerClient } from '@/lib/db/server'
import Link from 'next/link'

export default async function VagasPublicasPage() {
  const db = createServerClient()
  const { data: vagas } = await db
    .from('vagas')
    .select('*, empresa:empresas(nome)')
    .eq('status', 'aberta')
    .eq('publica', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a5e]">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#0066FF] bg-clip-text text-transparent">
            START PRO 5.0
          </h1>
        </Link>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link href="/auth/register" className="px-4 py-2 text-sm bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg">
            Cadastrar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-2">Vagas Disponiveis</h2>
        <p className="text-gray-400 mb-8">Encontre a oportunidade perfeita para voce</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!vagas || vagas.length === 0) ? (
            <p className="text-gray-400 col-span-full text-center py-12">Nenhuma vaga disponivel no momento.</p>
          ) : vagas.map((vaga: any) => (
            <div key={vaga.id} className="p-5 rounded-xl bg-[#111633] border border-[#1e2a5e] hover:border-[#00D4FF]/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-1">{vaga.titulo}</h3>
              <p className="text-xs text-[#00D4FF] mb-2">{vaga.empresa?.nome}</p>
              {vaga.categoria && (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#1e2a5e] text-gray-300 mb-2">{vaga.categoria}</span>
              )}
              {vaga.descricao && <p className="text-sm text-gray-400 line-clamp-3 mb-4">{vaga.descricao}</p>}
              <Link
                href={`/auth/register?vaga=${vaga.id}`}
                className="block text-center px-4 py-2 text-sm bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Candidatar-se
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
