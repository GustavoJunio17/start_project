'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { RespostaTeste } from '@/types/database'
import { ClipboardList } from 'lucide-react'

export default function MeusTestesPage() {
  const { user } = useAuth()
  const [respostas, setRespostas] = useState<RespostaTeste[]>([])
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
          .from('respostas_teste')
          .select('*')
          .eq('colaborador_id', col.id)
          .order('created_at', { ascending: false })
        setRespostas(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[#00D4FF]" /> Meus Testes
        </h1>
        <p className="text-gray-400 text-sm mt-1">{respostas.length} testes realizados</p>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a5e]">
          <p className="text-sm font-semibold text-white">Resultados</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duração</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Carregando...</td></tr>
            ) : respostas.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhum teste realizado</td></tr>
            ) : respostas.map(r => (
              <tr key={r.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    {r.tipo.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-white font-medium">{r.score ?? '-'}</td>
                <td className="px-4 py-3.5 text-gray-400">
                  {r.duracao_segundos ? `${Math.floor(r.duracao_segundos / 60)}min` : '-'}
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-xs">
                  {new Date(r.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
