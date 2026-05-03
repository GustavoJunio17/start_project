'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import type { Candidato } from '@/types/database'
import { Star, Trophy } from 'lucide-react'

const supabase = createClient()
const ITEMS_PER_PAGE = 20
const TROPHY_COLORS = ['#F59E0B', '#94A3B8', '#B45309']
const BORDER_CLASSES = ['border-[#F59E0B]', 'border-[#94A3B8]', 'border-[#B45309]']

export default function RankingPage() {
  const { user } = useAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase
        .from('candidatos').select('*, vaga:vagas(titulo)')
        .eq('empresa_id', user!.empresa_id!).not('match_score', 'is', null)
        .order('match_score', { ascending: false })
      setCandidatos(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const totalPages = Math.ceil(candidatos.length / ITEMS_PER_PAGE)
  const paginated = candidatos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <Star className="w-6 h-6 text-[#F59E0B]" /> Ranking de Candidatos
      </h1>

      {candidatos.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {candidatos.slice(0, 3).map((c, i) => (
            <div key={c.id} className={`bg-[#111633] border-2 ${BORDER_CLASSES[i]} rounded-xl p-4 text-center`}>
              <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: TROPHY_COLORS[i] }} />
              <p className="font-bold text-white text-sm">{c.nome_completo}</p>
              <p className="text-xs text-gray-500 mb-2">{(c.vaga as any)?.titulo || c.cargo_pretendido}</p>
              <div className="flex justify-center mb-1"><MatchScoreBadge score={c.match_score} /></div>
              <ClassificacaoBadge classificacao={c.classificacao} />
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden" id="ranking-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              {['#', 'Candidato', 'Vaga', 'Match', 'Classificação', 'DISC'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Carregando...</td></tr>
            ) : paginated.map((c, i) => (
              <tr key={c.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5 font-bold text-gray-500">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-white">{c.nome_completo}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </td>
                <td className="px-4 py-3.5 text-gray-400">{(c.vaga as any)?.titulo || '-'}</td>
                <td className="px-4 py-3.5"><MatchScoreBadge score={c.match_score} /></td>
                <td className="px-4 py-3.5"><ClassificacaoBadge classificacao={c.classificacao} /></td>
                <td className="px-4 py-3.5 w-40">
                  {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-gray-600">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={page} totalPages={totalPages} totalItems={candidatos.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
      </div>
    </div>
  )
}
