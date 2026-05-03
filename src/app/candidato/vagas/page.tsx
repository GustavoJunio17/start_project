'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { Vaga } from '@/types/database'
import { Search, Briefcase, Building2, ChevronDown, CalendarDays, FileText, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type VagaComEmpresa = Vaga & { empresa?: { nome: string } }

interface Candidatura {
  id: string
  vaga_id: string | null
  status: string
  created_at: string
  curriculo_nome: string | null
  linkedin: string | null
  pretensao_salarial: string | null
  mensagem: string | null
  vaga_titulo: string | null
  vaga_categoria: string | null
  vaga_descricao: string | null
  vaga_requisitos: string | null
  empresa_nome: string | null
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  contratado: 'Contratado',
}

const STATUS_COLOR: Record<string, string> = {
  pendente: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  em_analise: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  aprovado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reprovado: 'bg-red-500/10 text-red-400 border-red-500/20',
  contratado: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
}

function CandidaturaCard({ c, idx }: { c: Candidatura; idx: number }) {
  const [expanded, setExpanded] = useState(false)
  const statusLabel = STATUS_LABEL[c.status] ?? c.status
  const statusColor = STATUS_COLOR[c.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'

  return (
    <div
      className="glass-card overflow-hidden animate-in fade-in zoom-in-95 fill-mode-both"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00D4FF] font-bold shrink-0">
            {c.empresa_nome?.charAt(0) || 'V'}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{c.vaga_titulo || '—'}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <Building2 className="w-3 h-3" />
              <span>{c.empresa_nome || '—'}</span>
              {c.vaga_categoria && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="text-gray-600">{c.vaga_categoria}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          <span className="text-xs text-gray-600">
            {new Date(c.created_at).toLocaleDateString('pt-BR')}
          </span>
          <span className={cn('px-3 py-1.5 rounded-full text-xs font-bold border', statusColor)}>
            {statusLabel}
          </span>
          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform shrink-0', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-5 pb-5 pt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Inscrito em
              </p>
              <p className="text-sm text-white font-medium">
                {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {c.pretensao_salarial && (
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Pretensão salarial</p>
                <p className="text-sm text-white font-medium">{c.pretensao_salarial}</p>
              </div>
            )}
            {c.curriculo_nome && (
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Currículo</p>
                <p className="text-sm text-white font-medium truncate">{c.curriculo_nome}</p>
              </div>
            )}
          </div>

          {c.vaga_descricao && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Sobre a vaga
              </p>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{c.vaga_descricao}</p>
            </div>
          )}

          {c.vaga_requisitos && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-1.5">
                <ListChecks className="w-3 h-3" /> Requisitos
              </p>
              <div className="space-y-1">
                {c.vaga_requisitos.split('\n').filter(r => r.trim()).slice(0, 5).map((req, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-400">
                    <span className="text-[#00D4FF] font-bold mt-0.5 shrink-0">•</span>
                    <span>{req.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {c.linkedin && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">LinkedIn</p>
              <p className="text-sm text-[#00D4FF]">{c.linkedin}</p>
            </div>
          )}

          {c.vaga_id && (
            <Link
              href={`/vagas/${c.vaga_id}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#00D4FF] hover:text-white transition-colors"
            >
              Ver vaga completa →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function CandidatoVagasPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'disponiveis' | 'minhas'>('disponiveis')
  const [vagas, setVagas] = useState<VagaComEmpresa[]>([])
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: vagasData } = await supabase
        .from('vagas')
        .select('*, empresa:empresas(nome)')
        .eq('status', 'aberta')
        .order('created_at', { ascending: false })
      setVagas(vagasData || [])

      if (user) {
        const res = await fetch('/api/candidaturas/minhas', { credentials: 'include' })
        if (res.ok) {
          const json = await res.json()
          const list: Candidatura[] = json.data || []
          setCandidaturas(list)
          setAppliedIds(new Set(list.map(c => c.vaga_id).filter(Boolean) as string[]))
        }
      }
      setLoading(false)
    }
    load()
  }, [user])

  const filteredVagas = vagas
    .filter(v => !appliedIds.has(v.id))
    .filter(v =>
      v.titulo.toLowerCase().includes(search.toLowerCase()) ||
      v.categoria?.toLowerCase().includes(search.toLowerCase()) ||
      (v.empresa as any)?.nome?.toLowerCase().includes(search.toLowerCase())
    )

  const filteredCandidaturas = candidaturas.filter(c =>
    c.vaga_titulo?.toLowerCase().includes(search.toLowerCase()) ||
    c.empresa_nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#00D4FF]" /> Vagas
          </h1>
          <p className="text-gray-400 text-sm mt-1">Explore oportunidades e acompanhe suas candidaturas.</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-[#00D4FF]/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D4FF] transition-colors" />
          <input
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111633]/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all relative z-10"
          />
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-fit">
        <button
          onClick={() => setTab('disponiveis')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
            tab === 'disponiveis'
              ? 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white shadow-lg shadow-[#00D4FF]/20'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Disponíveis
          <span className={cn('ml-2 text-xs px-1.5 py-0.5 rounded-full', tab === 'disponiveis' ? 'bg-white/20' : 'bg-white/[0.05]')}>
            {vagas.length - appliedIds.size}
          </span>
        </button>
        <button
          onClick={() => setTab('minhas')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
            tab === 'minhas'
              ? 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white shadow-lg shadow-[#00D4FF]/20'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Minhas Candidaturas
          <span className={cn('ml-2 text-xs px-1.5 py-0.5 rounded-full', tab === 'minhas' ? 'bg-white/20' : 'bg-white/[0.05]')}>
            {candidaturas.length}
          </span>
        </button>
      </div>

      {tab === 'disponiveis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card h-48 animate-pulse" />)
          ) : filteredVagas.length === 0 ? (
            <div className="glass-card col-span-full py-20 text-center border-dashed">
              <Search size={40} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma vaga disponível no momento.</p>
            </div>
          ) : filteredVagas.map((vaga, idx) => (
            <div
              key={vaga.id}
              className="glass-card p-6 hover:border-[#00D4FF]/30 hover:-translate-y-1 transition-all group animate-in fade-in zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00D4FF] font-bold group-hover:border-[#00D4FF]/40 transition-colors">
                  {(vaga.empresa as any)?.nome?.charAt(0) || 'V'}
                </div>
                {vaga.categoria && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    {vaga.categoria}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-white mb-1 group-hover:text-[#00D4FF] transition-colors">{vaga.titulo}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Building2 className="w-3 h-3" />
                <span>{(vaga.empresa as any)?.nome}</span>
              </div>
              {vaga.descricao && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">{vaga.descricao}</p>
              )}
              <Link
                href={`/vagas/${vaga.id}`}
                className="block w-full py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-white rounded-xl font-semibold text-sm text-center group-hover:bg-gradient-to-r group-hover:from-[#00D4FF] group-hover:to-[#0066FF] group-hover:border-transparent transition-all group-hover:shadow-lg group-hover:shadow-[#00D4FF]/20"
              >
                Candidatar-se
              </Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'minhas' && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)
          ) : filteredCandidaturas.length === 0 ? (
            <div className="glass-card py-20 text-center border-dashed">
              <Briefcase size={40} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">Você ainda não se candidatou a nenhuma vaga.</p>
            </div>
          ) : filteredCandidaturas.map((c, idx) => (
            <CandidaturaCard key={c.id} c={c} idx={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
