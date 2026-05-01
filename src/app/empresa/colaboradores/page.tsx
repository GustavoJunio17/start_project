'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import { FormColaborador } from '@/components/admin/colaboradores/FormColaborador'
import type { Colaborador, StatusColaborador } from '@/types/database'
import { Search, Plus, Upload, MoreHorizontal, Edit, Trash } from 'lucide-react'

const supabase = createClient()

async function fetchColaboradores(): Promise<Colaborador[]> {
  const res = await fetch('/api/empresa/colaboradores')
  if (!res.ok) return []
  return res.json()
}

const ITEMS_PER_PAGE = 20

const STATUS_COLORS: Record<StatusColaborador, string> = {
  em_treinamento: 'bg-blue-500/20 text-blue-400',
  ativo: 'bg-green-500/20 text-green-400',
  desligado: 'bg-red-500/20 text-red-400',
}

const STATUS_LABELS: Record<StatusColaborador, string> = {
  em_treinamento: 'Em Treinamento',
  ativo: 'Ativo',
  desligado: 'Desligado',
}

export default function ColaboradoresPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [origemFilter, setOrigemFilter] = useState('todos')
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [colabToEdit, setColabToEdit] = useState<Colaborador | null>(null)

  const fetchData = async () => {
    if (!user?.empresa_id) return
    setLoading(true)
    const data = await fetchColaboradores()
    setColaboradores(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user?.empresa_id])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return
    await supabase.from('colaboradores').delete().eq('id', id)
    fetchData()
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.empresa_id) return
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })
      return row
    })
    for (const row of rows) {
      await supabase.from('colaboradores').insert({
        empresa_id: user.empresa_id,
        nome: row.nome || row.name || '',
        cargo: row.cargo || row.position || '',
        email: row.email || '',
        origem: 'importacao_planilha',
        data_contratacao: new Date().toISOString().split('T')[0],
        proxima_reavaliacao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
    fetchData()
  }

  const filtered = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
                          c.cargo?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter
    const matchesOrigem = origemFilter === 'todos' || c.origem === origemFilter
    return matchesSearch && matchesStatus && matchesOrigem
  })

  useEffect(() => setPage(1), [search, statusFilter, origemFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const empresaAtual = user ? [{ id: user.empresa_id!, nome: user.empresa_nome! }] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground">{colaboradores.length} colaboradores</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <Button variant="outline" className="border-border">
              <Upload className="w-4 h-4 mr-2" /> Importar CSV
            </Button>
          </label>
          <Button
            className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
            onClick={() => { setColabToEdit(null); setIsFormOpen(true) }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cargo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="em_treinamento">Em Treinamento</SelectItem>
            <SelectItem value="desligado">Desligado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={origemFilter} onValueChange={v => v && setOrigemFilter(v)}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Origens</SelectItem>
            <SelectItem value="contratacao_direta">Contratação Direta</SelectItem>
            <SelectItem value="promocao">Promoção</SelectItem>
            <SelectItem value="importacao_planilha">Importação Planilha</SelectItem>
            <SelectItem value="processo_seletivo">Processo Seletivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Colaborador</TableHead>
              <TableHead>Cargo / Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contratação</TableHead>
              <TableHead>Reavaliação</TableHead>
              <TableHead>DISC</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando colaboradores...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : paginated.map(c => (
              <TableRow key={c.id} className="border-border">
                <TableCell>
                  <div className="font-medium text-foreground">{c.nome}</div>
                  <div className="text-xs text-muted-foreground">{c.email || '-'}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.cargo || '-'}</TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[c.status]}>
                    {STATUS_LABELS[c.status] || c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.data_contratacao ? new Date(c.data_contratacao).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.proxima_reavaliacao ? new Date(c.proxima_reavaliacao).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="w-40">
                  {c.perfil_disc
                    ? <DISCBars perfil={c.perfil_disc} />
                    : <span className="text-xs text-muted-foreground">Pendente</span>}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setColabToEdit(c); setIsFormOpen(true) }}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {isFormOpen && (
        <FormColaborador
          colaborador={colabToEdit}
          empresas={empresaAtual}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); fetchData() }}
        />
      )}
    </div>
  )
}
