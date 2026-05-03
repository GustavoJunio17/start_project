import { createServerClient } from '@/lib/db/server'
import Link from 'next/link'

export default async function VagasPublicasPage() {
  const db = createServerClient()
  const { data: vagas } = await db
    .from('vagas')
    .select('*, empresa:empresas(nome)')
    .eq('status', 'aberta')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col">
      {/* Background artifacts */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#0066FF]/5 blur-[100px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.08] backdrop-blur-md bg-[#0A0E27]/40">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center shadow-lg shadow-[#00D4FF]/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            START <span className="text-[#00D4FF]">PRO</span>
          </h1>
        </Link>
        <div className="flex gap-4">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link href="/auth/register" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-xl shadow-lg shadow-[#00D4FF]/20 hover:shadow-[#00D4FF]/40 hover:-translate-y-0.5 transition-all">
            Cadastrar
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 w-full flex-1">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Oportunidades em aberto</h2>
          <p className="text-gray-400 max-w-2xl">Encontre seu próximo desafio profissional em empresas de alto crescimento que utilizam a nossa tecnologia para contratar os melhores talentos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!vagas || vagas.length === 0) ? (
            <div className="col-span-full py-20 text-center glass-card">
              <p className="text-gray-400">Nenhuma vaga disponível no momento. Volte em breve!</p>
            </div>
          ) : vagas.map((vaga: any, idx: number) => (
            <div
              key={vaga.id}
              className="group glass-card p-6 flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:border-[#00D4FF]/40 transition-colors">
                    <span className="text-lg font-bold text-[#00D4FF]">{vaga.empresa?.nome?.charAt(0) || 'V'}</span>
                  </div>
                  {vaga.categoria && (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                      {vaga.categoria}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00D4FF] transition-colors">{vaga.titulo}</h3>
                <p className="text-sm text-gray-400 font-medium mb-4">{vaga.empresa?.nome}</p>

                {vaga.descricao && (
                  <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                    {vaga.descricao}
                  </p>
                )}
              </div>

              <Link
                href={`/vagas/${vaga.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-white rounded-xl font-semibold text-sm group-hover:bg-gradient-to-r group-hover:from-[#00D4FF] group-hover:to-[#0066FF] group-hover:border-transparent transition-all group-hover:shadow-lg group-hover:shadow-[#00D4FF]/20"
              >
                Visualizar Detalhes
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 py-10 px-8 border-t border-white/[0.05] text-center">
        <p className="text-gray-600 text-xs italic">© {new Date().getFullYear()} Start Pro 5.0 — Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
