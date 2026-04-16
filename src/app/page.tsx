import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0E27] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#0066FF] bg-clip-text text-transparent">
          START PRO 5.0
        </h1>
        <div className="flex gap-3">
          <Link
            href="/vagas"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Vagas Disponiveis
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Encontre os{' '}
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] bg-clip-text text-transparent">
              talentos ideais
            </span>{' '}
            para sua empresa
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Plataforma completa de recrutamento com avaliacao comportamental DISC,
            testes tecnicos, gestao de candidatos e desenvolvimento continuo de colaboradores.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Candidatar-se
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border border-[#1e2a5e] text-white rounded-lg font-medium hover:bg-[#111633] transition-colors"
            >
              Acessar Painel
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { title: 'Teste DISC', desc: 'Avaliacao comportamental completa com match de perfil ideal' },
              { title: 'Multi-empresa', desc: 'Plataforma SaaS com isolamento total de dados por empresa' },
              { title: 'IA Integrada', desc: 'Treinamentos personalizados gerados por inteligencia artificial' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl bg-[#111633] border border-[#1e2a5e]">
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
