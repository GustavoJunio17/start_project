"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, Plus, Search, Building2 } from "lucide-react"
import type { Colaborador, Empresa } from "@/types/database"
import { FormColaborador } from "./FormColaborador"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 20

export function ListarColaboradores() {
  const [colaboradores, setColaboradores] = useState<(Colaborador & { empresa: { nome: string } })[]>([])
  const [empresas, setEmpresas] = useState<Pick<Empresa, 'id' | 'nome'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [empresaFilter, setEmpresaFilter] = useState<string>('todas')
  const supabase = createClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [colabToEdit, setColabToEdit] = useState<Colaborador | null>(null)
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    
    const { data: colsData } = await supabase.from('colaboradores').select('*, empresa:empresas(nome)').order('nome')
    setColaboradores(colsData || [])
    
    const { data: empresasData } = await supabase.from('empresas').select('id, nome').order('nome')
    setEmpresas(empresasData || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return
    
    const { error } = await supabase.from('colaboradores').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir colaborador: ' + error.message)
      return
    }
    fetchData()
  }

  const filteredColabs = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase()) || 
                          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter
    const matchesEmpresa = empresaFilter === 'todas' || c.empresa_id === empresaFilter

    return matchesSearch && matchesStatus && matchesEmpresa
  })

  const totalPages = Math.ceil(filteredColabs.length / ITEMS_PER_PAGE)
  const paginatedColabs = filteredColabs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => setPage(1), [search, statusFilter, empresaFilter])

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'ativo': return 'bg-green-500 hover:bg-green-600'
      case 'em_treinamento': return 'bg-blue-500 hover:bg-blue-600'
      case 'desligado': return 'bg-red-500 hover:bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'ativo': return 'Ativo'
      case 'em_treinamento': return 'Em Treinamento'
      case 'desligado': return 'Desligado'
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="relative w-full xl:w-[350px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
          <Select value={empresaFilter} onValueChange={(v) => v !== null && setEmpresaFilter(v)}>
            <SelectTrigger className="w-[200px]">
              <span className="truncate">
                {empresaFilter === 'todas' 
                  ? 'Todas as Empresas' 
                  : empresas.find(e => e.id === empresaFilter)?.nome || 'Todas as Empresas'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Empresas</SelectItem>
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="em_treinamento">Em Treinamento</SelectItem>
              <SelectItem value="desligado">Desligado</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => { setColabToEdit(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cargo / Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contratação</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando colaboradores...
                </TableCell>
              </TableRow>
            ) : filteredColabs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : paginatedColabs.map(colab => (
              <TableRow key={colab.id}>
                <TableCell>
                  <div className="font-medium">{colab.nome}</div>
                  <div className="text-sm text-muted-foreground">{colab.email || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{colab.empresa?.nome || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{colab.cargo || '-'}</span>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusBadgeColor(colab.status)} text-white border-0`}>
                    {getStatusLabel(colab.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {colab.data_contratacao ? new Date(colab.data_contratacao).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setColabToEdit(colab); setIsFormOpen(true); }}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(colab.id)}>
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
          totalItems={filteredColabs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {isFormOpen && (
        <FormColaborador 
          colaborador={colabToEdit} 
          empresas={empresas}
          onClose={() => setIsFormOpen(false)} 
          onSaved={() => { setIsFormOpen(false); fetchData(); }} 
        />
      )}
    </div>
  )
}
