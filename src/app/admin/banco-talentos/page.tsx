'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Candidato } from '@/types/database'
import { Search, Database } from 'lucide-react'

export default function BancoTalentosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo), empresa:empresas(nome)')
        .eq('disponivel_banco_talentos', true)
        .order('match_score', { ascending: false })
      setCandidatos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = candidatos.filter(c =>
    c.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo_pretendido?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-[#00D4FF]" /> Banco de Talentos Global
          </h1>
          <p className="text-gray-400 text-sm mt-1">{candidatos.length} candidatos disponíveis</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
        <input
          placeholder="Buscar por nome ou cargo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 w-full bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
        />
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Candidato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cargo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Match</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Classificação</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Perfil DISC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">Nenhum candidato encontrado</td>
              </tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-medium text-white">{c.nome_completo}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-400">{c.cargo_pretendido || '-'}</td>
                <td className="px-4 py-3.5 text-gray-400">{(c.empresa as any)?.nome || '-'}</td>
                <td className="px-4 py-3.5"><MatchScoreBadge score={c.match_score} /></td>
                <td className="px-4 py-3.5"><ClassificacaoBadge classificacao={c.classificacao} /></td>
                <td className="px-4 py-3.5 w-48">
                  {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-gray-500 text-xs">Sem teste</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
