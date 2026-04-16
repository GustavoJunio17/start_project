'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, UserCheck, ClipboardList, CheckCircle, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EmpresaDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ vagas: 0, candidatos: 0, colaboradores: 0, testes: 0, aprovados: 0, reprovados: 0 })
  const [vagasData, setVagasData] = useState<{ titulo: string; candidatos: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const [vagasRes, candidatosRes, colaboradoresRes] = await Promise.all([
        supabase.from('vagas').select('id, titulo').eq('empresa_id', user!.empresa_id!),
        supabase.from('candidatos').select('id, vaga_id, status_candidatura').eq('empresa_id', user!.empresa_id!),
        supabase.from('colaboradores').select('id').eq('empresa_id', user!.empresa_id!),
      ])

      const vagas = vagasRes.data || []
      const candidatos = candidatosRes.data || []
      const colaboradores = colaboradoresRes.data || []

      const aprovados = candidatos.filter(c => c.status_candidatura === 'aprovado' || c.status_candidatura === 'contratado').length
      const reprovados = candidatos.filter(c => c.status_candidatura === 'reprovado').length

      setStats({
        vagas: vagas.length,
        candidatos: candidatos.length,
        colaboradores: colaboradores.length,
        testes: 0,
        aprovados,
        reprovados,
      })

      // Candidatos por vaga
      const vagaMap = vagas.map(v => ({
        titulo: v.titulo.length > 15 ? v.titulo.substring(0, 15) + '...' : v.titulo,
        candidatos: candidatos.filter(c => c.vaga_id === v.id).length,
      }))
      setVagasData(vagaMap)
      setLoading(false)
    }
    load()
  }, [user, supabase])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" /></div>
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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">{user?.empresa_nome || 'Minha Empresa'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(c => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-4">
              <c.icon className="w-5 h-5 mb-2" style={{ color: c.color }} />
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {vagasData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Candidatos por Vaga</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vagasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                <XAxis dataKey="titulo" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="candidatos" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
