'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { Feedback } from '@/types/database'
import { MessageSquare, StopCircle, Play, RefreshCw, Zap } from 'lucide-react'

export default function MeusFeedbacksPage() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      const { data: col } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('user_id', user!.id)
        .single()

      if (col) {
        const { data } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('colaborador_id', col.id)
          .order('created_at', { ascending: false })
        setFeedbacks(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Meus Feedbacks</h1>
        <p className="text-gray-400 text-sm mt-1">{feedbacks.length} feedbacks recebidos</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl py-10 text-center">
            <MessageSquare size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Nenhum feedback recebido ainda</p>
          </div>
        ) : feedbacks.map(fb => (
          <div key={fb.id} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
              <span className="text-xs text-gray-500">
                {new Date(fb.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Parar', value: fb.parar, icon: StopCircle, color: '#EF4444' },
                { label: 'Começar', value: fb.comecar, icon: Play, color: '#10B981' },
                { label: 'Continuar', value: fb.continuar, icon: RefreshCw, color: '#0066FF' },
                { label: 'Ação', value: fb.acao, icon: Zap, color: '#F59E0B' },
              ].map(q => (
                <div key={q.label} className="p-2.5 rounded-lg bg-[#0A0E27] border border-[#1e2a5e]">
                  <div className="flex items-center gap-1 mb-1.5">
                    <q.icon className="w-3 h-3" style={{ color: q.color }} />
                    <span className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{q.value || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
