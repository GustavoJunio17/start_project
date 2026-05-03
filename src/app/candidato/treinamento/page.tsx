'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { TreinamentoIA } from '@/types/database'
import { GraduationCap, BookOpen, Zap } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
  em_andamento: 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20',
  concluido: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
}

export default function CandidatoTreinamentoPage() {
  const { user } = useAuth()
  const [treinamentos, setTreinamentos] = useState<TreinamentoIA[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: colabs } = await supabase.from('colaboradores').select('id').eq('user_id', user!.id)
      if (!colabs?.length) { setLoading(false); return }
      const ids = colabs.map(c => c.id)
      const { data } = await supabase.from('treinamentos_ia').select('*').in('colaborador_id', ids).order('created_at', { ascending: false })
      setTreinamentos(data || [])
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
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-[#00D4FF]" /> Trilha de Treinamento
      </h1>

      {treinamentos.length === 0 ? (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl py-10 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">Nenhum treinamento disponível no momento.</p>
          <p className="text-xs text-gray-600 mt-1">Treinamentos serão gerados após sua aprovação em uma vaga.</p>
        </div>
      ) : treinamentos.map(t => (
        <div key={t.id} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-white text-sm">{t.cargo || 'Treinamento'}</p>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status] || STATUS_COLORS.pendente}`}>
              {t.status.replace('_', ' ')}
            </span>
          </div>
          {t.gerado_por_ia && (
            <span className="inline-flex items-center gap-1 mb-3 px-2 py-0.5 rounded-full text-xs border border-[#8B5CF6]/20 text-[#8B5CF6] bg-[#8B5CF6]/10">
              <Zap className="w-3 h-3" /> Gerado por IA
            </span>
          )}
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {t.conteudo_gerado || 'Conteúdo em geração...'}
          </p>
        </div>
      ))}
    </div>
  )
}
