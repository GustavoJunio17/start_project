"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, Plus, Search, Building2, Globe, Lock } from "lucide-react"
import type { Vaga, Empresa } from "@/types/database"
import { FormVaga } from "./FormVaga"

export function ListarVagas() {
  const [vagas, setVagas] = useState<(Vaga & { empresa: { nome: string } })[]>([])
  const [empresas, setEmpresas] = useState<Pick<Empresa, 'id' | 'nome'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [empresaFilter, setEmpresaFilter] = useState<string>('todas')
  const supabase = createClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [vagaToEdit, setVagaToEdit] = useState<Vaga | null>(null)

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch vagas com os dados da empresa usando join do supabase
    const { data: vagasData } = await supabase.from('vagas').select('*, empresa:empresas(nome)').order('created_at', { ascending: false })
    setVagas(vagasData || [])
    
    const { data: empresasData } = await supabase.from('empresas').select('id, nome').order('nome')
    setEmpresas(empresasData || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return
    
    const { error } = await supabase.from('vagas').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir vaga: ' + error.message)
      return
    }
    fetchData()
  }

  const filteredVagas = vagas.filter(v => {
    const matchesSearch = v.titulo.toLowerCase().includes(search.toLowerCase()) || 
                          (v.categoria && v.categoria.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'todos' || v.status === statusFilter
    const matchesEmpresa = empresaFilter === 'todas' || v.empresa_id === empresaFilter

    return matchesSearch && matchesStatus && matchesEmpresa
  })

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'aberta': return 'bg-green-500 hover:bg-green-600'
      case 'pausada': return 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'
      case 'encerrada': return 'bg-gray-500 hover:bg-gray-600'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'aberta': return 'Aberta'
      case 'pausada': return 'Pausada'
      case 'encerrada': return 'Encerrada'
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="relative w-full xl:w-[350px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por título ou categoria..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
          <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="pausada">Pausada</SelectItem>
              <SelectItem value="encerrada">Encerrada</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => { setVagaToEdit(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Criar Vaga
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título da Vaga / Categoria</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibilidade</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando vagas...
                </TableCell>
              </TableRow>
            ) : filteredVagas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma vaga encontrada.
                </TableCell>
              </TableRow>
            ) : filteredVagas.map(vaga => (
              <TableRow key={vaga.id}>
                <TableCell>
                  <div className="font-medium text-blue-500">{vaga.titulo}</div>
                  <div className="text-sm text-muted-foreground">{vaga.categoria || 'Sem categoria'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vaga.empresa?.nome || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusBadgeColor(vaga.status)} text-white border-0 transition-colors`}>
                    {getStatusLabel(vaga.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {vaga.publica ? (
                    <div className="flex items-center gap-1.5 text-sm text-green-500">
                      <Globe className="h-4 w-4" /> Pública
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" /> Privada
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(vaga.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setVagaToEdit(vaga); setIsFormOpen(true); }}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(vaga.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <FormVaga 
          vaga={vagaToEdit} 
          empresas={empresas}
          onClose={() => setIsFormOpen(false)} 
          onSaved={() => { setIsFormOpen(false); fetchData(); }} 
        />
      )}
    </div>
  )
}
