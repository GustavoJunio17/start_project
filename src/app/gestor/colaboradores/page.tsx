'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DISCChart, DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import type { Colaborador, StatusColaborador } from '@/types/database'
import { Search, Eye, AlertTriangle } from 'lucide-react'

const supabase = createClient()

const ITEMS_PER_PAGE = 20

const STATUS_COLORS: Record<StatusColaborador, string> = {
  em_treinamento: 'bg-blue-500/20 text-blue-400',
  ativo: 'bg-green-500/20 text-green-400',
  desligado: 'bg-red-500/20 text-red-400',
}

export default function GestorColaboradoresPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Colaborador | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('empresa_id', user!.empresa_id!)
        .order('nome')
      setColaboradores(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = colaboradores.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo?.toLowerCase().includes(search.toLowerCase())
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const needsReavaliacao = (c: Colaborador) => {
    if (!c.proxima_reavaliacao) return false
    return new Date(c.proxima_reavaliacao) <= new Date()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.nome}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Cargo: <span className="text-foreground">{selected.cargo || '-'}</span></p>
                  <p className="text-muted-foreground">E-mail: <span className="text-foreground">{selected.email || '-'}</span></p>
                  <p className="text-muted-foreground">Status: <Badge className={STATUS_COLORS[selected.status]}>{selected.status}</Badge></p>
                  <p className="text-muted-foreground">Origem: <span className="text-foreground">{selected.origem.replace(/_/g, ' ')}</span></p>
                </div>
                {selected.perfil_disc && (
                  <>
                    <DISCChart perfil={selected.perfil_disc} size={250} />
                    <DISCBars perfil={selected.perfil_disc} />
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reavaliacao</TableHead>
                <TableHead>DISC</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : paginated.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell>
                    <p className="font-medium text-foreground">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.cargo || '-'}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {needsReavaliacao(c) && <AlertTriangle className="w-3 h-3 text-[#EF4444]" />}
                      <span className={`text-xs ${needsReavaliacao(c) ? 'text-[#EF4444]' : 'text-muted-foreground'}`}>
                        {c.proxima_reavaliacao ? new Date(c.proxima_reavaliacao).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-40">
                    {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-xs text-muted-foreground">Pendente</span>}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(c)}><Eye className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}
