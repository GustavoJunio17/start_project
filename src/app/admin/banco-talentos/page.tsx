'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Candidato } from '@/types/database'
import { Search, Database } from 'lucide-react'

export default function BancoTalentosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo), empresa:empresas(nome)')
        .eq('disponivel_banco_talentos', true)
        .order('match_score', { ascending: false })
      setCandidatos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = candidatos.filter(c =>
    c.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo_pretendido?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-6 h-6 text-[#00D4FF]" /> Banco de Talentos Global
        </h1>
        <p className="text-muted-foreground">{candidatos.length} candidatos disponiveis</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou cargo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Candidato</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Classificacao</TableHead>
                <TableHead>Perfil DISC</TableHead>
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
                  <TableCell className="text-muted-foreground">{c.cargo_pretendido || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{(c.empresa as any)?.nome || '-'}</TableCell>
                  <TableCell><MatchScoreBadge score={c.match_score} /></TableCell>
                  <TableCell><ClassificacaoBadge classificacao={c.classificacao} /></TableCell>
                  <TableCell className="w-48">
                    {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-muted-foreground text-xs">Sem teste</span>}
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
