'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import type { Candidato, StatusCandidatura } from '@/types/database'
import { Search, Eye } from 'lucide-react'
import Link from 'next/link'

const STATUS_LABELS: Record<StatusCandidatura, string> = {
  inscrito: 'Inscrito',
  em_avaliacao: 'Em Avaliacao',
  entrevista_agendada: 'Entrevista',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  contratado: 'Contratado',
}

const STATUS_COLORS: Record<StatusCandidatura, string> = {
  inscrito: 'bg-gray-500/20 text-gray-400',
  em_avaliacao: 'bg-blue-500/20 text-blue-400',
  entrevista_agendada: 'bg-purple-500/20 text-purple-400',
  aprovado: 'bg-green-500/20 text-green-400',
  reprovado: 'bg-red-500/20 text-red-400',
  contratado: 'bg-yellow-500/20 text-yellow-400',
}

export default function CandidatosPage() {
  const { user } = useAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const supabase = createClient()

  const loadCandidatos = async () => {
    if (!user?.empresa_id) return
    const { data } = await supabase
      .from('candidatos')
      .select('*, vaga:vagas(titulo)')
      .eq('empresa_id', user.empresa_id)
      .order('created_at', { ascending: false })
    setCandidatos(data || [])
    setLoading(false)
  }

  useEffect(() => { loadCandidatos() }, [user])

  const handleStatusChange = async (id: string, status: StatusCandidatura) => {
    await supabase.from('candidatos').update({ status_candidatura: status }).eq('id', id)

    // If approved, create colaborador
    if (status === 'contratado') {
      const candidato = candidatos.find(c => c.id === id)
      if (candidato) {
        await supabase.from('colaboradores').insert({
          user_id: candidato.user_id,
          empresa_id: candidato.empresa_id,
          nome: candidato.nome_completo,
          cargo: candidato.cargo_pretendido,
          email: candidato.email,
          data_contratacao: new Date().toISOString().split('T')[0],
          origem: 'conversao_candidato',
          perfil_disc: candidato.perfil_disc,
          proxima_reavaliacao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      }
    }

    loadCandidatos()
  }

  const filtered = candidatos.filter(c => {
    const matchSearch = c.nome_completo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status_candidatura === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidatos</h1>
        <p className="text-muted-foreground">{candidatos.length} candidatos</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
        <Select value={filterStatus} onValueChange={v => v && setFilterStatus(v)}>
          <SelectTrigger className="w-40 bg-card border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Candidato</TableHead>
                <TableHead>Vaga</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Classificacao</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{c.nome_completo}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(c.vaga as any)?.titulo || '-'}</TableCell>
                  <TableCell><MatchScoreBadge score={c.match_score} /></TableCell>
                  <TableCell><ClassificacaoBadge classificacao={c.classificacao} /></TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[c.status_candidatura]}>
                      {STATUS_LABELS[c.status_candidatura]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={c.status_candidatura} onValueChange={v => handleStatusChange(c.id, v as StatusCandidatura)}>
                      <SelectTrigger className="w-32 h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
