'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, Star, Trophy, Filter } from 'lucide-react'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import { Button } from '@/components/ui/button'
import type { Candidato, Vaga } from '@/types/database'

const COLORS = ['#00D4FF', '#0066FF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']
const supabase = createClient()

interface CandidatoComVaga extends Candidato {
  vaga?: Vaga | null
}

export default function RelatoriosGestorPage() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    statusDist: { name: string; value: number }[]
    classifDist: { name: string; value: number }[]
  }>({ statusDist: [], classifDist: [] })
  const [candidatos, setCandidatos] = useState<CandidatoComVaga[]>([])
  const [setores, setSetores] = useState<{ id: string; nome: string }[]>([])
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.empresa_id || user.role !== 'gestor_rh') return

    async function load() {
      // Carregar setores do gestor
      const { data: gestorSetores } = await supabase
        .from('gestor_rh_setores')
        .select('cargos_departamento_id')
        .eq('user_id', user.id!)

      if (!gestorSetores || gestorSetores.length === 0) {
        setLoading(false)
        return
      }

      const setorIds = gestorSetores.map(g => g.cargos_departamento_id)

      const { data: setoresData } = await supabase
        .from('cargos_departamentos')
        .select('id, nome')
        .in('id', setorIds)

      if (setoresData) {
        setSetores(setoresData)
        if (setoresData.length > 0) setSetorSelecionado(setoresData[0].id)
      }

      // Carregar candidatos da empresa
      const { data: allCandidatos } = await supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo, departamento)')
        .eq('empresa_id', user!.empresa_id!)

      if (allCandidatos) {
        setCandidatos(allCandidatos)

        // Calcular distribuição
        const statusMap: Record<string, number> = {}
        const classifMap: Record<string, number> = {}
        allCandidatos.forEach(c => {
          statusMap[c.status_candidatura] = (statusMap[c.status_candidatura] || 0) + 1
          if (c.classificacao) classifMap[c.classificacao] = (classifMap[c.classificacao] || 0) + 1
        })

        setData({
          statusDist: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
          classifDist: Object.entries(classifMap).map(([name, value]) => ({ name, value })),
        })
      }

      setLoading(false)
    }

    load()
  }, [user])

  // Filtrar candidatos por setor selecionado
  const candidatosFiltrados = setorSelecionado
    ? candidatos.filter(c => {
        const vagaDept = c.vaga?.departamento
        return setores.some(s => s.id === setorSelecionado && s.nome === vagaDept)
      })
    : candidatos

  // Ordenar por match_score
  const topCandidatos = candidatosFiltrados
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    .filter(c => c.match_score !== null)

  if (loading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#00D4FF]" /> Relatórios de Desempenho
      </h1>

      {/* Filtro por Setor */}
      {setores.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Filter className="w-4 h-4" /> Meus Setores</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {setores.map(setor => (
                <Button
                  key={setor.id}
                  variant={setorSelecionado === setor.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSetorSelecionado(setor.id)}
                >
                  {setor.nome}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Melhores Candidatos do Setor */}
      {topCandidatos.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#F59E0B]" /> Melhores Perfis do Setor
          </h2>
          <div className={`grid ${topCandidatos.length >= 3 ? 'grid-cols-3' : topCandidatos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {topCandidatos.slice(0, 3).map((c, i) => (
              <Card key={c.id} className={`bg-card border-2 ${i === 0 ? 'border-[#F59E0B]' : i === 1 ? 'border-[#94A3B8]' : 'border-[#B45309]'}`}>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#B45309' }} />
                  <p className="font-bold text-foreground text-sm">{c.nome_completo}</p>
                  <p className="text-xs text-muted-foreground mb-3">{c.vaga?.titulo || c.cargo_pretendido}</p>
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <MatchScoreBadge score={c.match_score} />
                    </div>
                    <ClassificacaoBadge classificacao={c.classificacao} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum candidato com avaliação encontrado para este setor.
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Candidatos por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.statusDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Distribuição de Classificação</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.classifDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {data.classifDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Completo */}
      {topCandidatos.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Ranking Completo</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>DISC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCandidatos.map((c, i) => (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground text-sm">{c.nome_completo}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.vaga?.titulo || '-'}</TableCell>
                    <TableCell><MatchScoreBadge score={c.match_score} /></TableCell>
                    <TableCell><ClassificacaoBadge classificacao={c.classificacao} /></TableCell>
                    <TableCell className="w-40">
                      {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {topCandidatos.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum candidato com avaliação encontrado para este setor.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
