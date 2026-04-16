'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, ClipboardList, MessageSquare, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function GestorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ candidatos: 0, colaboradores: 0, testes: 0, feedbacks: 0, agendamentos: 0, alertas: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const [candRes, colRes, fbRes, agRes, alertRes] = await Promise.all([
        supabase.from('candidatos').select('id', { count: 'exact', head: true }).eq('empresa_id', user!.empresa_id!),
        supabase.from('colaboradores').select('id', { count: 'exact', head: true }).eq('empresa_id', user!.empresa_id!),
        supabase.from('feedbacks').select('id', { count: 'exact', head: true }).eq('empresa_id', user!.empresa_id!),
        supabase.from('agendamentos').select('id', { count: 'exact', head: true }).eq('empresa_id', user!.empresa_id!),
        supabase.from('alertas_automaticos').select('id', { count: 'exact', head: true }).eq('empresa_id', user!.empresa_id!).eq('lido', false),
      ])
      setStats({
        candidatos: candRes.count || 0,
        colaboradores: colRes.count || 0,
        testes: 0,
        feedbacks: fbRes.count || 0,
        agendamentos: agRes.count || 0,
        alertas: alertRes.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" /></div>
  }

  const cards = [
    { label: 'Candidatos', value: stats.candidatos, icon: Users, color: '#00D4FF', href: '/gestor/candidatos' },
    { label: 'Colaboradores', value: stats.colaboradores, icon: UserCheck, color: '#10B981', href: '/gestor/colaboradores' },
    { label: 'Feedbacks', value: stats.feedbacks, icon: MessageSquare, color: '#0066FF', href: '/gestor/feedbacks' },
    { label: 'Agendamentos', value: stats.agendamentos, icon: Calendar, color: '#F59E0B', href: '/gestor/candidatos' },
    { label: 'Alertas', value: stats.alertas, icon: AlertTriangle, color: '#EF4444', href: '/gestor/candidatos' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard do Gestor</h1>
        <p className="text-muted-foreground">{user?.empresa_nome}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href}>
            <Card className="bg-card border-border hover:border-[#00D4FF]/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <c.icon className="w-5 h-5 mb-2" style={{ color: c.color }} />
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
