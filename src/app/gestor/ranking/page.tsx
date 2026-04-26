'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import type { Candidato } from '@/types/database'
import { Star, Trophy } from 'lucide-react'

const supabase = createClient()

const ITEMS_PER_PAGE = 20

export default function RankingPage() {
  const { user } = useAuth()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo)')
        .eq('empresa_id', user!.empresa_id!)
        .not('match_score', 'is', null)
        .order('match_score', { ascending: false })
      setCandidatos(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const totalPages = Math.ceil(candidatos.length / ITEMS_PER_PAGE)
  const paginated = candidatos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Star className="w-6 h-6 text-[#F59E0B]" /> Ranking de Candidatos
      </h1>

      {/* Top 3 */}
      {candidatos.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {candidatos.slice(0, 3).map((c, i) => (
            <Card key={c.id} className={`bg-card border-2 ${i === 0 ? 'border-[#F59E0B]' : i === 1 ? 'border-[#94A3B8]' : 'border-[#B45309]'}`}>
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#B45309' }} />
                <p className="font-bold text-foreground">{c.nome_completo}</p>
                <p className="text-xs text-muted-foreground">{(c.vaga as any)?.titulo || c.cargo_pretendido}</p>
                <div className="mt-2 flex justify-center">
                  <MatchScoreBadge score={c.match_score} />
                </div>
                <ClassificacaoBadge classificacao={c.classificacao} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-card border-border" id="ranking-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Candidato</TableHead>
                <TableHead>Vaga</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Classificacao</TableHead>
                <TableHead>DISC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : paginated.map((c, i) => (
                <TableRow key={c.id} className="border-border">
                  <TableCell className="font-bold text-muted-foreground">{(page - 1) * ITEMS_PER_PAGE + i + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{c.nome_completo}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(c.vaga as any)?.titulo || '-'}</TableCell>
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
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={candidatos.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}
