'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { DISCChart, DISCBars } from '@/components/disc/DISCChart'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import type { Candidato } from '@/types/database'
import { ClipboardList, Calendar, MessageSquare, Briefcase, CheckCircle, Clock, XCircle, Brain } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUS_TIMELINE = [
  { key: 'inscrito', label: 'Inscrito', icon: ClipboardList },
  { key: 'em_avaliacao', label: 'Em Avaliação', icon: Clock },
  { key: 'entrevista_agendada', label: 'Entrevista', icon: Calendar },
  { key: 'aprovado', label: 'Aprovado', icon: CheckCircle },
]

const STATUS_ORDER = ['inscrito', 'em_avaliacao', 'entrevista_agendada', 'aprovado', 'contratado']

export default function CandidatoDashboard() {
  const { user } = useAuth()
  const [candidaturas, setCandidaturas] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo, perfil_disc_ideal), empresa:empresas(nome)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      setCandidaturas(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Minha Área</h1>
        <p className="text-gray-400 text-sm mt-1">Bem-vindo de volta, <span className="text-[#00D4FF] font-medium">{user?.nome_completo}</span></p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Meus Testes', icon: ClipboardList, href: '/candidato/testes', color: '#00D4FF', bg: 'bg-[#00D4FF]/10' },
          { label: 'Agendamentos', icon: Calendar, href: '/candidato/agendamentos', color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
          { label: 'Feedbacks', icon: MessageSquare, href: '/candidato/feedbacks', color: '#10B981', bg: 'bg-[#10B981]/10' },
          { label: 'Vagas', icon: Briefcase, href: '/candidato/vagas', color: '#0066FF', bg: 'bg-[#0066FF]/10' },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <div className="glass-card p-5 text-center hover:border-[#00D4FF]/30 hover:-translate-y-1 transition-all cursor-pointer group">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110", item.bg)}>
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Candidaturas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#00D4FF]" />
            Minhas Candidaturas
          </h2>
        </div>
        
        {candidaturas.length === 0 ? (
          <div className="glass-card py-16 text-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Você ainda não se candidatou a nenhuma vaga.
            </p>
            <Link href="/candidato/vagas" className="btn-primary">
              Ver vagas disponíveis
            </Link>
          </div>
        ) : candidaturas.map(cand => {
          const currentIndex = STATUS_ORDER.indexOf(cand.status_candidatura)
          const isReprovado = cand.status_candidatura === 'reprovado'

          return (
            <div key={cand.id} className="glass-card p-6 hover:border-[#00D4FF]/20 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/10 to-[#0066FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-lg">
                    {(cand.vaga as any)?.titulo?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{(cand.vaga as any)?.titulo || 'Vaga'}</h3>
                    <p className="text-sm text-gray-500">{(cand.empresa as any)?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={cand.match_score} />
                  <ClassificacaoBadge classificacao={cand.classificacao} />
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#0A0E27]/50 rounded-2xl p-4 border border-white/[0.03]">
                {isReprovado ? (
                  <div className="flex items-center gap-2 text-[#EF4444] py-2">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Processo Encerrado</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-2">
                    {STATUS_TIMELINE.map((step, i) => {
                      const isCompleted = currentIndex >= i
                      const isCurrent = STATUS_ORDER[currentIndex] === step.key
                      return (
                        <div key={step.key} className="flex items-center gap-2 flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-2 relative">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                              isCompleted ? "bg-[#00D4FF] text-[#0A0E27] shadow-[0_0_15px_rgba(0,212,255,0.4)]" : "bg-[#1e2a5e] text-gray-500",
                              isCurrent && "ring-4 ring-[#00D4FF]/20 scale-110"
                            )}>
                              <step.icon className={cn("w-4 h-4", isCurrent && "animate-pulse")} />
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tighter absolute -bottom-6 whitespace-nowrap hidden sm:block",
                              isCompleted ? "text-[#00D4FF]" : "text-gray-600"
                            )}>{step.label}</span>
                          </div>
                          {i < STATUS_TIMELINE.length - 1 && (
                            <div className="flex-1 h-[2px] bg-[#1e2a5e] overflow-hidden rounded-full">
                              <div 
                                className={cn("h-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF] transition-all duration-1000 ease-out")} 
                                style={{ width: isCompleted ? '100%' : '0%' }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* DISC Profile Summary */}
              {cand.perfil_disc && (
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-t border-white/[0.05] pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#00D4FF]">
                      <Brain className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Match Comportamental</span>
                    </div>
                    <DISCBars perfil={cand.perfil_disc} />
                  </div>
                  <div className="flex justify-center bg-white/[0.02] rounded-3xl p-4 border border-white/[0.03]">
                    <DISCChart
                      perfil={cand.perfil_disc}
                      perfilIdeal={(cand.vaga as any)?.perfil_disc_ideal}
                      size={200}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
