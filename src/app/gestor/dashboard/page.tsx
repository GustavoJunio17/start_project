'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { ClipboardList, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { Colaborador } from '@/types/database'

export default function ColaboradorDashboard() {
  const { user } = useAuth()
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [counts, setCounts] = useState({ testes: 0, feedbacks: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      const { data: col } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (col) {
        const [testRes, fbRes] = await Promise.all([
          supabase.from('respostas_teste').select('id', { count: 'exact', head: true }).eq('colaborador_id', col.id),
          supabase.from('feedbacks').select('id', { count: 'exact', head: true }).eq('colaborador_id', col.id),
        ])
        setCounts({ testes: testRes.count || 0, feedbacks: fbRes.count || 0 })
        setColaborador(col)
      }
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

  const cards = [
    { label: 'Testes Realizados', value: counts.testes, icon: ClipboardList, color: '#00D4FF', href: '/gestor/testes' },
    { label: 'Feedbacks Recebidos', value: counts.feedbacks, icon: MessageSquare, color: '#10B981', href: '/gestor/feedbacks' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Bem-vindo, {colaborador?.nome || user?.nome_completo}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {colaborador?.cargo || 'Colaborador'} · {user?.empresa_nome}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href}>
            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4 hover:border-[#00D4FF]/30 transition-colors cursor-pointer group">
              <c.icon className="w-5 h-5 mb-2.5 group-hover:text-[#00D4FF] transition-colors" style={{ color: c.color }} />
              <p className="text-2xl font-bold text-white">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {colaborador?.perfil_disc && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Meu Perfil DISC</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            {(['D', 'I', 'S', 'C'] as const).map((dim) => {
              const colors: Record<string, string> = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#0066FF' }
              return (
                <div key={dim} className="bg-[#0A0E27] border border-[#1e2a5e] rounded-lg p-3">
                  <div className="text-2xl font-bold" style={{ color: colors[dim] }}>
                    {colaborador.perfil_disc![dim]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{dim}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {colaborador && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Meus Dados</p>
          <div className="space-y-2.5">
            {colaborador.departamento && (
              <p className="text-sm text-gray-500">Departamento: <span className="text-gray-300">{colaborador.departamento}</span></p>
            )}
            {colaborador.nivel && (
              <p className="text-sm text-gray-500">Nível: <span className="text-gray-300">{colaborador.nivel}</span></p>
            )}
            {colaborador.modelo_trabalho && (
              <p className="text-sm text-gray-500">Modelo: <span className="text-gray-300">{colaborador.modelo_trabalho}</span></p>
            )}
            {colaborador.data_contratacao && (
              <p className="text-sm text-gray-500">
                Contratado em: <span className="text-gray-300">{new Date(colaborador.data_contratacao).toLocaleDateString('pt-BR')}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
