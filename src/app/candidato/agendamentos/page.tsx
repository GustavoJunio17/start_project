'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { Agendamento } from '@/types/database'
import { Calendar, Video, MapPin, Clock } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  agendado: 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20',
  confirmado: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  realizado: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  cancelado: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
  remarcado: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#00D4FF]" /> Agendamentos
        </h1>
        <p className="text-gray-400 text-sm mt-1">{agendamentos.length} agendamentos</p>
      </div>

      {agendamentos.length === 0 ? (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl py-10 text-center">
          <Calendar size={28} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Nenhum agendamento no momento.</p>
        </div>
      ) : agendamentos.map(ag => (
        <div key={ag.id} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00D4FF]" />
                <span className="font-medium text-white">
                  {new Date(ag.data_hora).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="text-gray-400">
                  {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {ag.tipo === 'online' ? (
                  <>
                    <Video className="w-4 h-4" />
                    <span>Online</span>
                    {ag.link_reuniao && (
                      <a href={ag.link_reuniao} target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline">
                        Acessar reunião
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
              {ag.observacoes && <p className="text-xs text-gray-500">{ag.observacoes}</p>}
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLORS[ag.status] || 'bg-gray-500/10 text-gray-400'}`}>
              {ag.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
