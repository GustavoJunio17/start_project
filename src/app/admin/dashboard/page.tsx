'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import {
  Building2, Users, ClipboardList, TrendingUp, CheckCircle, XCircle,
  Briefcase, UserCheck, MessageSquare, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

const COLORS = ['#00D4FF', '#0066FF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']

const STATUS_COLORS: Record<string, string> = {
  ativa: '#10B981',
  inativa: '#F59E0B',
  bloqueada: '#EF4444',
  aberta: '#10B981',
  pausada: '#F59E0B',
  encerrada: '#EF4444',
  rascunho: '#94A3B8',
  ativo: '#10B981',
  em_treinamento: '#00D4FF',
  desligado: '#EF4444',
  aprovado: '#10B981',
  contratado: '#0066FF',
  reprovado: '#EF4444',
  inscrito: '#94A3B8',
  em_avaliacao: '#F59E0B',
  entrevista_agendada: '#00D4FF',
  starter: '#94A3B8',
  profissional: '#00D4FF',
  enterprise: '#8B5CF6',
}

interface DashboardData {
  totais: {
    empresas: number
    usuarios: number
    candidatos: number
    vagas: number
    vagasAbertas: number
    colaboradores: number
    testes: number
    feedbacks: number
    taxaAprovacao: number
    taxaReprovacao: number
  }
  empresasDetalhe: {
    id: string
    nome: string
    segmento: string
    plano: string
    status: string
    data_cadastro: string
    total_usuarios: number
    total_vagas: number
    vagas_abertas: number
    total_candidatos: number
    total_colaboradores: number
  }[]
  charts: {
    empresasPorSegmento: { name: string; value: number }[]
    empresasPorPlano: { name: string; value: number }[]
    empresasPorStatus: { name: string; value: number }[]
    vagasPorStatus: { name: string; value: number }[]
    candidatosPorStatus: { name: string; value: number }[]
    colaboradoresPorStatus: { name: string; value: number }[]
    usuariosPorRole: { name: string; value: number }[]
    crescimentoMensal: { mes: string; empresas: number }[]
  }
  atividadeRecente: { tipo: string; descricao: string; data: string }[]
}

const TIPO_LABEL: Record<string, string> = {
  empresa: 'Nova empresa',
  candidato: 'Novo candidato',
  vaga: 'Nova vaga',
}

const TIPO_COLOR: Record<string, string> = {
  empresa: '#00D4FF',
  candidato: '#F59E0B',
  vaga: '#10B981',
}

const PLANO_LABEL: Record<string, string> = {
  starter: 'Starter',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" />
      </div>
    )
  }

  if (!data) return null

  const { totais, charts, empresasDetalhe, atividadeRecente } = data

  const kpiCards = [
    { label: 'Empresas', value: totais.empresas, icon: Building2, color: '#00D4FF' },
    { label: 'Usuários', value: totais.usuarios, icon: Users, color: '#0066FF' },
    { label: 'Candidatos', value: totais.candidatos, icon: ClipboardList, color: '#F59E0B' },
    { label: 'Vagas abertas', value: `${totais.vagasAbertas}/${totais.vagas}`, icon: Briefcase, color: '#10B981' },
    { label: 'Colaboradores', value: totais.colaboradores, icon: UserCheck, color: '#8B5CF6' },
    { label: 'Testes', value: totais.testes, icon: TrendingUp, color: '#00D4FF' },
    { label: 'Feedbacks', value: totais.feedbacks, icon: MessageSquare, color: '#EC4899' },
    { label: 'Aprovação', value: `${totais.taxaAprovacao}%`, icon: CheckCircle, color: '#10B981' },
    { label: 'Reprovação', value: `${totais.taxaReprovacao}%`, icon: XCircle, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard CRM</h1>
        <p className="text-muted-foreground">Bem-vindo, {user?.nome_completo} — visão geral de todas as empresas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {kpiCards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-3">
              <card.icon className="w-4 h-4 mb-1" style={{ color: card.color }} />
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Empresas por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.empresasPorSegmento} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {charts.empresasPorSegmento.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Empresas por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.empresasPorPlano} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={(props: { name?: string; value?: number }) => `${PLANO_LABEL[props.name ?? ''] ?? props.name}: ${props.value}`} labelLine={false}>
                  {charts.empresasPorPlano.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? COLORS[0]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Crescimento de Empresas (12m)</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.crescimentoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={charts.crescimentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                  <XAxis dataKey="mes" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="empresas" stroke="#00D4FF" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12 text-sm">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Top Empresas por Candidatos</CardTitle>
          </CardHeader>
          <CardContent>
            {empresasDetalhe.slice(0, 7).some(e => e.total_candidatos > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={empresasDetalhe.slice(0, 7)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis dataKey="nome" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="total_candidatos" fill="#00D4FF" radius={[0, 4, 4, 0]} name="Candidatos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12 text-sm">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Candidatos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.candidatosPorStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Candidatos" radius={[4, 4, 0, 0]}>
                  {charts.candidatosPorStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Status das Empresas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {charts.empresasPorStatus.map(({ name, value }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[name] ?? '#94A3B8' }} />
                  <span className="text-sm text-muted-foreground capitalize">{name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Vagas por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {charts.vagasPorStatus.map(({ name, value }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[name] ?? '#94A3B8' }} />
                  <span className="text-sm text-muted-foreground capitalize">{name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00D4FF]" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {atividadeRecente.length > 0 ? atividadeRecente.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: TIPO_COLOR[a.tipo] ?? '#94A3B8' }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{TIPO_LABEL[a.tipo] ?? a.tipo}</p>
                  <p className="text-xs text-foreground truncate">{a.descricao}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatDate(a.data)}</span>
              </div>
            )) : (
              <p className="text-muted-foreground text-center text-sm py-4">Sem atividade recente</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de empresas */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground">Todas as Empresas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2 font-medium">Empresa</th>
                  <th className="text-left px-4 py-2 font-medium">Segmento</th>
                  <th className="text-left px-4 py-2 font-medium">Plano</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Usuários</th>
                  <th className="text-right px-4 py-2 font-medium">Vagas</th>
                  <th className="text-right px-4 py-2 font-medium">Candidatos</th>
                  <th className="text-right px-4 py-2 font-medium">Colaboradores</th>
                  <th className="text-right px-4 py-2 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {empresasDetalhe.map((e) => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{e.nome}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.segmento}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: `${STATUS_COLORS[e.plano] ?? '#94A3B8'}22`, color: STATUS_COLORS[e.plano] ?? '#94A3B8' }}>
                        {PLANO_LABEL[e.plano] ?? e.plano}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize"
                        style={{ background: `${STATUS_COLORS[e.status] ?? '#94A3B8'}22`, color: STATUS_COLORS[e.status] ?? '#94A3B8' }}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-foreground">{e.total_usuarios}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-foreground">{e.vagas_abertas}</span>
                      <span className="text-muted-foreground">/{e.total_vagas}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-foreground">{e.total_candidatos}</td>
                    <td className="px-4 py-2.5 text-right text-foreground">{e.total_colaboradores}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{formatDate(e.data_cadastro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {empresasDetalhe.length === 0 && (
              <p className="text-muted-foreground text-center py-8 text-sm">Nenhuma empresa cadastrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
