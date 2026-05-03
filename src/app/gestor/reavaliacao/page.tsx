'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Colaborador } from '@/types/database'
import { Target, AlertTriangle } from 'lucide-react'

export default function ReavaliacaoPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase.from('colaboradores').select('*')
        .eq('empresa_id', user!.empresa_id!).neq('status', 'desligado')
        .order('proxima_reavaliacao', { ascending: true, nullsFirst: false })
      setColaboradores(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const isVencido = (date: string | null) => date ? new Date(date) <= new Date() : false
  const isProximo = (date: string | null) => {
    if (!date) return false
    const diff = new Date(date).getTime() - Date.now()
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
  }

  const vencidos = colaboradores.filter(c => isVencido(c.proxima_reavaliacao))
  const proximos = colaboradores.filter(c => isProximo(c.proxima_reavaliacao))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <Target className="w-6 h-6 text-[#00D4FF]" /> Ciclo de Reavaliação (90 dias)
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111633] border border-[#1e2a5e] border-l-2 border-l-[#EF4444] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            <div>
              <p className="text-2xl font-bold text-white">{vencidos.length}</p>
              <p className="text-xs text-gray-500">Reavaliações vencidas</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111633] border border-[#1e2a5e] border-l-2 border-l-[#F59E0B] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <p className="text-2xl font-bold text-white">{proximos.length}</p>
              <p className="text-xs text-gray-500">Próximos 7 dias</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a5e]">
          <p className="text-sm font-semibold text-white">Colaboradores</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              {['Nome', 'Cargo', 'Status', 'Próxima Reavaliação', 'DISC'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Carregando...</td></tr>
            ) : colaboradores.map(c => (
              <tr key={c.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5 font-medium text-white">{c.nome}</td>
                <td className="px-4 py-3.5 text-gray-400">{c.cargo || '-'}</td>
                <td className="px-4 py-3.5">
                  {isVencido(c.proxima_reavaliacao) ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">Vencido</span>
                  ) : isProximo(c.proxima_reavaliacao) ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">Próximo</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Em dia</span>
                  )}
                </td>
                <td className={`px-4 py-3.5 text-sm ${isVencido(c.proxima_reavaliacao) ? 'text-[#EF4444] font-medium' : 'text-gray-400'}`}>
                  {c.proxima_reavaliacao ? new Date(c.proxima_reavaliacao).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-4 py-3.5 w-40">
                  {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-xs text-gray-600">Pendente</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
