'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Agendamento } from '@/types/database'
import { Calendar, Video, MapPin, Clock } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  agendado: 'bg-blue-500/20 text-blue-400',
  confirmado: 'bg-green-500/20 text-green-400',
  realizado: 'bg-gray-500/20 text-gray-400',
  cancelado: 'bg-red-500/20 text-red-400',
  remarcado: 'bg-yellow-500/20 text-yellow-400',
}

export default function CandidatoAgendamentosPage() {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: candidaturas } = await supabase
        .from('candidatos')
        .select('id')
        .eq('user_id', user!.id)

      if (!candidaturas?.length) { setLoading(false); return }

      const ids = candidaturas.map(c => c.id)
      const { data } = await supabase
        .from('agendamentos')
        .select('*')
        .in('candidato_id', ids)
        .order('data_hora', { ascending: true })

      setAgendamentos(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Calendar className="w-6 h-6 text-[#00D4FF]" /> Agendamentos
      </h1>

      {agendamentos.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum agendamento no momento.
          </CardContent>
        </Card>
      ) : agendamentos.map(ag => (
        <Card key={ag.id} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00D4FF]" />
                  <span className="font-medium text-foreground">
                    {new Date(ag.data_hora).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {ag.tipo === 'online' ? (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Online</span>
                      {ag.link_reuniao && (
                        <a href={ag.link_reuniao} target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline">
                          Acessar reuniao
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>{ag.endereco || 'Presencial'}</span>
                    </>
                  )}
                </div>
                {ag.observacoes && <p className="text-xs text-muted-foreground">{ag.observacoes}</p>}
              </div>
              <Badge className={STATUS_COLORS[ag.status]}>{ag.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
