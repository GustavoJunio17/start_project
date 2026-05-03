'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import type { AlertaAutomatico } from '@/types/database'
import { Bell, CheckCircle, AlertTriangle, Clock, Target } from 'lucide-react'

const TIPO_CONFIG = {
  candidato_score_baixo: { label: 'Score Baixo', icon: AlertTriangle, color: '#EF4444' },
  teste_pendente: { label: 'Teste Pendente', icon: Clock, color: '#F59E0B' },
  feedback_atrasado: { label: 'Feedback Atrasado', icon: Target, color: '#0066FF' },
  reavaliacao_vencida: { label: 'Reavaliação Vencida', icon: Bell, color: '#8B5CF6' },
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaAutomatico[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadAlertas = async () => {
    const { data } = await supabase
      .from('alertas_automaticos')
      .select('*')
      .order('created_at', { ascending: false })
    setAlertas(data || [])
    setLoading(false)
  }

  useEffect(() => { loadAlertas() }, [])

  const markAsRead = async (id: string) => {
    await supabase.from('alertas_automaticos').update({ lido: true }).eq('id', id)
    loadAlertas()
  }

  const naoLidos = alertas.filter(a => !a.lido).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00D4FF]" /> Alertas do Sistema
          </h1>
          <p className="text-gray-400 text-sm mt-1">{naoLidos} alertas não lidos</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
          </div>
        ) : alertas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00D4FF]/10 flex items-center justify-center mb-4">
              <Bell size={28} className="text-[#00D4FF]" />
            </div>
            <h3 className="text-white font-semibold mb-2">Nenhum alerta</h3>
            <p className="text-gray-500 text-sm">Nenhum alerta no momento</p>
          </div>
        ) : alertas.map(alerta => {
          const config = TIPO_CONFIG[alerta.tipo as keyof typeof TIPO_CONFIG]
          if (!config) return null
          const Icon = config.icon
          return (
            <div
              key={alerta.id}
              className={`bg-[#111633] border border-[#1e2a5e] rounded-xl p-4 flex items-center justify-between ${!alerta.lido ? 'border-l-[3px]' : ''}`}
              style={{ borderLeftColor: !alerta.lido ? config.color : undefined }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${config.color}18` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: `${config.color}18`, color: config.color }}
                    >
                      {config.label}
                    </span>
                    {!alerta.lido && <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />}
                  </div>
                  <p className="text-sm text-gray-300">{alerta.mensagem}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alerta.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              {!alerta.lido && (
                <button
                  onClick={() => markAsRead(alerta.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#10B981] hover:bg-[#10B981]/10 transition-colors shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
