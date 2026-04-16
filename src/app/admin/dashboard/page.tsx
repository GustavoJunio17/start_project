'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Building2, Users, ClipboardList, TrendingUp, CheckCircle, XCircle, Clock, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface KPIs {
  totalEmpresas: number
  totalUsuarios: number
  totalTestes: number
  totalCandidatos: number
  taxaAprovacao: number
  taxaReprovacao: number
  empresasPorSegmento: { name: string; value: number }[]
  testesPorMes: { mes: string; testes: number }[]
  topEmpresas: { nome: string; candidatos: number }[]
}

const COLORS = ['#00D4FF', '#0066FF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']

export default function AdminDashboard() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadKPIs() {
      const [empresasRes, usersRes, candidatosRes, testesRes] = await Promise.all([
        supabase.from('empresas').select('id, nome, segmento, status'),
        supabase.from('users').select('id, role'),
        supabase.from('candidatos').select('id, empresa_id, status_candidatura, created_at'),
        supabase.from('respostas_teste').select('id, created_at'),
      ])

      const empresas = empresasRes.data || []
      const users = usersRes.data || []
      const candidatos = candidatosRes.data || []
      const testes = testesRes.data || []

      const aprovados = candidatos.filter(c => c.status_candidatura === 'aprovado' || c.status_candidatura === 'contratado').length
      const reprovados = candidatos.filter(c => c.status_candidatura === 'reprovado').length
      const total = candidatos.length || 1

      // Empresas por segmento
      const segmentoMap: Record<string, number> = {}
      empresas.forEach(e => {
        segmentoMap[e.segmento] = (segmentoMap[e.segmento] || 0) + 1
      })
      const empresasPorSegmento = Object.entries(segmentoMap).map(([name, value]) => ({ name, value }))

      // Top empresas
      const empresaCandidatoMap: Record<string, { nome: string; candidatos: number }> = {}
      candidatos.forEach(c => {
        if (!empresaCandidatoMap[c.empresa_id]) {
          const emp = empresas.find(e => e.id === c.empresa_id)
          empresaCandidatoMap[c.empresa_id] = { nome: emp?.nome || 'Desconhecida', candidatos: 0 }
        }
        empresaCandidatoMap[c.empresa_id].candidatos++
      })
      const topEmpresas = Object.values(empresaCandidatoMap)
        .sort((a, b) => b.candidatos - a.candidatos)
        .slice(0, 5)

      setKpis({
        totalEmpresas: empresas.length,
        totalUsuarios: users.length,
        totalTestes: testes.length,
        totalCandidatos: candidatos.length,
        taxaAprovacao: Math.round((aprovados / total) * 100),
        taxaReprovacao: Math.round((reprovados / total) * 100),
        empresasPorSegmento,
        testesPorMes: [],
        topEmpresas,
      })
      setLoading(false)
    }

    loadKPIs()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" />
      </div>
    )
  }

  if (!kpis) return null

  const statCards = [
    { label: 'Empresas', value: kpis.totalEmpresas, icon: Building2, color: '#00D4FF' },
    { label: 'Usuarios', value: kpis.totalUsuarios, icon: Users, color: '#0066FF' },
    { label: 'Candidatos', value: kpis.totalCandidatos, icon: ClipboardList, color: '#F59E0B' },
    { label: 'Testes', value: kpis.totalTestes, icon: TrendingUp, color: '#10B981' },
    { label: 'Aprovacao', value: `${kpis.taxaAprovacao}%`, icon: CheckCircle, color: '#10B981' },
    { label: 'Reprovacao', value: `${kpis.taxaReprovacao}%`, icon: XCircle, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard CRM</h1>
        <p className="text-muted-foreground">Bem-vindo, {user?.nome_completo}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresas por Segmento */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Empresas por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={kpis.empresasPorSegmento}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {kpis.empresasPorSegmento.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Empresas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Top 5 Empresas por Candidatos</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.topEmpresas.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kpis.topEmpresas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                  <XAxis dataKey="nome" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="candidatos" fill="#00D4FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
