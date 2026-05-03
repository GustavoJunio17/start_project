'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Briefcase, Users, UserCheck, CheckCircle, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const supabase = createClient()

export default function EmpresaDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ vagas: 0, candidatos: 0, colaboradores: 0, testes: 0, aprovados: 0, reprovados: 0 })
  const [vagasData, setVagasData] = useState<{ titulo: string; candidatos: number }[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      try {
        const res = await fetch('/api/empresa/dashboard')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setStats(data.stats)
        setVagasData(data.vagasData)
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.empresa_id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: 'Vagas Abertas', value: stats.vagas, icon: Briefcase, color: '#00D4FF' },
    { label: 'Candidatos', value: stats.candidatos, icon: Users, color: '#0066FF' },
    { label: 'Colaboradores', value: stats.colaboradores, icon: UserCheck, color: '#10B981' },
    { label: 'Aprovados', value: stats.aprovados, icon: CheckCircle, color: '#F59E0B' },
    { label: 'Reprovados', value: stats.reprovados, icon: XCircle, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.empresa_nome || 'Minha Empresa'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
            <c.icon className="w-5 h-5 mb-2.5" style={{ color: c.color }} />
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {vagasData.length > 0 && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Candidatos por Vaga</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vagasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
              <XAxis dataKey="titulo" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111633', border: '1px solid #1e2a5e', borderRadius: 8 }} />
              <Bar dataKey="candidatos" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
