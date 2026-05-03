'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, Star, Trophy, Filter } from 'lucide-react'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Candidato, Vaga } from '@/types/database'

const COLORS = ['#00D4FF', '#0066FF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']
const supabase = createClient()
type CandidatoComVaga = Candidato & { vaga?: Vaga | null }
const TROPHY_COLORS = ['#F59E0B', '#94A3B8', '#B45309']
const BORDER_CLASSES = ['border-[#F59E0B]', 'border-[#94A3B8]', 'border-[#B45309]']

export default function RelatoriosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<{ statusDist: { name: string; value: number }[]; classifDist: { name: string; value: number }[] }>({ statusDist: [], classifDist: [] })
  const [candidatos, setCandidatos] = useState<CandidatoComVaga[]>([])
  const [setores, setSetores] = useState<{ id: string; nome: string }[]>([])
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data: allCandidatos } = await supabase.from('candidatos').select('*, vaga:vagas(titulo, departamento)').eq('empresa_id', user!.empresa_id!)
      if (!allCandidatos) return
      if (user?.role === 'gestor_rh') {
        const { data: gestorSetores } = await supabase.from('gestor_rh_setores').select('cargos_departamento_id').eq('user_id', user.id!)
        if (gestorSetores?.length) {
          const setorIds = gestorSetores.map(g => g.cargos_departamento_id)
          const { data: setoresData } = await supabase.from('cargos_departamentos').select('id, nome').in('id', setorIds)
          if (setoresData) { setSetores(setoresData); if (setoresData.length > 0) setSetorSelecionado(setoresData[0].id) }
        }
      }
      setCandidatos(allCandidatos)
      const statusMap: Record<string, number> = {}
      const classifMap: Record<string, number> = {}
      allCandidatos.forEach(c => {
        statusMap[c.status_candidatura] = (statusMap[c.status_candidatura] || 0) + 1
        if (c.classificacao) classifMap[c.classificacao] = (classifMap[c.classificacao] || 0) + 1
      })
      setData({ statusDist: Object.entries(statusMap).map(([name, value]) => ({ name, value })), classifDist: Object.entries(classifMap).map(([name, value]) => ({ name, value })) })
    }
    load()
  }, [user])

  const candidatosFiltrados = user?.role === 'gestor_rh' && setorSelecionado
    ? candidatos.filter(c => { const vagaDept = c.vaga?.departamento; return setores.some(s => s.id === setorSelecionado && s.nome === vagaDept) })
    : candidatos
  const topCandidatos = candidatosFiltrados.filter(c => c.status_candidatura === 'inscrito' || c.disponivel_banco_talentos).sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).filter(c => c.match_score !== null)
  const irParaCandidato = (id: string) => router.push(`/empresa/candidatos?ver=${id}`)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#00D4FF]" /> Relatórios
      </h1>

      {user?.role === 'gestor_rh' && setores.length > 0 && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm font-semibold text-white">Filtrar por Setor</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {setores.map(setor => (
              <button key={setor.id} onClick={() => setSetorSelecionado(setor.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${setorSelecionado === setor.id ? 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white' : 'border border-[#1e2a5e] text-gray-300 hover:border-[#00D4FF]/40 hover:text-white'}`}>
                {setor.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {topCandidatos.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#F59E0B]" /> Melhores Perfis
          </h2>
          <div className={`grid ${topCandidatos.length >= 3 ? 'grid-cols-3' : topCandidatos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {topCandidatos.slice(0, 3).map((c, i) => (
              <div key={c.id} onClick={() => irParaCandidato(c.id)}
                className={`bg-[#111633] border-2 ${BORDER_CLASSES[i]} rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-opacity`}>
                <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: TROPHY_COLORS[i] }} />
                <p className="font-bold text-white text-sm">{c.nome_completo}</p>
                <p className="text-xs text-gray-500 mb-3">{c.vaga?.titulo || c.cargo_pretendido}</p>
                <div className="flex justify-center mb-1"><MatchScoreBadge score={c.match_score} /></div>
                <ClassificacaoBadge classificacao={c.classificacao} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-8 text-center text-gray-500">
          Nenhum candidato com avaliação encontrado.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
          <p className="text-sm font-semibold text-white mb-4">Candidatos por Status</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.statusDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
          <p className="text-sm font-semibold text-white mb-4">Distribuição de Classificação</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.classifDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {data.classifDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topCandidatos.length > 3 && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2a5e]">
            <p className="text-sm font-semibold text-white">Ranking de Candidatos</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a5e]">
                {['#', 'Candidato', 'Vaga', 'Match', 'Classificação', 'DISC'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCandidatos.map((c, i) => (
                <tr key={c.id} onClick={() => irParaCandidato(c.id)}
                  className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors cursor-pointer last:border-0">
                  <td className="px-4 py-3.5 font-bold text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-white text-sm">{c.nome_completo}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-sm">{c.vaga?.titulo || '-'}</td>
                  <td className="px-4 py-3.5"><MatchScoreBadge score={c.match_score} /></td>
                  <td className="px-4 py-3.5"><ClassificacaoBadge classificacao={c.classificacao} /></td>
                  <td className="px-4 py-3.5 w-40">
                    {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-gray-600">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
