'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DISCChart, DISCBars } from '@/components/disc/DISCChart'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import type { Candidato } from '@/types/database'
import { ClipboardList, Calendar, MessageSquare, Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_TIMELINE = [
  { key: 'inscrito', label: 'Inscrito', icon: ClipboardList },
  { key: 'em_avaliacao', label: 'Em Avaliacao', icon: Clock },
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minha Area</h1>
        <p className="text-muted-foreground">Bem-vindo, {user?.nome_completo}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Meus Testes', icon: ClipboardList, href: '/candidato/testes', color: '#00D4FF' },
          { label: 'Agendamentos', icon: Calendar, href: '/candidato/agendamentos', color: '#F59E0B' },
          { label: 'Feedbacks', icon: MessageSquare, href: '/candidato/feedbacks', color: '#10B981' },
          { label: 'Vagas', icon: Briefcase, href: '/candidato/vagas', color: '#0066FF' },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <Card className="bg-card border-border hover:border-[#00D4FF]/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <item.icon className="w-6 h-6 mx-auto mb-2" style={{ color: item.color }} />
                <p className="text-sm text-foreground">{item.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Candidaturas */}
      <h2 className="text-lg font-semibold text-foreground">Minhas Candidaturas</h2>
      {candidaturas.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground">
            Voce ainda nao se candidatou a nenhuma vaga.{' '}
            <Link href="/candidato/vagas" className="text-[#00D4FF] hover:underline">Ver vagas disponiveis</Link>
          </CardContent>
        </Card>
      ) : candidaturas.map(cand => {
        const currentIndex = STATUS_ORDER.indexOf(cand.status_candidatura)
        const isReprovado = cand.status_candidatura === 'reprovado'

        return (
          <Card key={cand.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{(cand.vaga as any)?.titulo || 'Vaga'}</CardTitle>
                  <p className="text-xs text-muted-foreground">{(cand.empresa as any)?.nome}</p>
                </div>
                <div className="flex items-center gap-2">
                  <MatchScoreBadge score={cand.match_score} />
                  <ClassificacaoBadge classificacao={cand.classificacao} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Timeline */}
              {isReprovado ? (
                <div className="flex items-center gap-2 text-[#EF4444]">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Reprovado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {STATUS_TIMELINE.map((step, i) => {
                    const isCompleted = currentIndex >= i
                    const isCurrent = STATUS_ORDER[currentIndex] === step.key
                    return (
                      <div key={step.key} className="flex items-center gap-2 flex-1">
                        <div className={`flex items-center gap-1 ${isCompleted ? 'text-[#00D4FF]' : 'text-muted-foreground'}`}>
                          <step.icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                          <span className="text-xs hidden md:block">{step.label}</span>
                        </div>
                        {i < STATUS_TIMELINE.length - 1 && (
                          <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-[#00D4FF]' : 'bg-muted'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* DISC Profile */}
              {cand.perfil_disc && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DISCBars perfil={cand.perfil_disc} />
                  <DISCChart
                    perfil={cand.perfil_disc}
                    perfilIdeal={(cand.vaga as any)?.perfil_disc_ideal}
                    size={180}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
