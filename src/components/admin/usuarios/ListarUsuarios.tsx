"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, UserPlus, Search, Building2 } from "lucide-react"
import type { User, Role, Empresa } from "@/types/database"
import { FormUsuario } from "./FormUsuario"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 20

export function ListarUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [empresas, setEmpresas] = useState<Pick<Empresa, 'id' | 'nome'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [empresaFilter, setEmpresaFilter] = useState<string>('todas')
  const supabase = createClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [formMode, setFormMode] = useState<'convidar' | 'criar'>('convidar')
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    
    // Buscar usuários
    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setUsers(usersData || [])
    
    // Buscar empresas para o filtro
    const { data: empresasData } = await supabase.from('empresas').select('id, nome').order('nome')
    setEmpresas(empresasData || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    // Deleta o usuário da tabela
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir usuário: ' + error.message)
      return
    }
    fetchData()
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('users').update({ ativo: !currentStatus }).eq('id', id)
    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      return
    }
    fetchData()
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nome_completo.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && u.ativo) || 
      (statusFilter === 'inativo' && !u.ativo)
    const matchesEmpresa = empresaFilter === 'todas' || u.empresa_id === empresaFilter

    return matchesSearch && matchesRole && matchesStatus && matchesEmpresa
  })

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [search, roleFilter, statusFilter, empresaFilter])

  const getRoleBadgeColor = (role: Role) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-500'
      case 'user_empresa': return 'bg-blue-500'
      case 'gestor_rh': return 'bg-green-500'
      default: return 'bg-gray-500'
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

          <Select value={roleFilter} onValueChange={(v) => v !== null && setRoleFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Níveis</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="gestor_rh">Gestor RH</SelectItem>
              <SelectItem value="colaborador">Colaborador</SelectItem>
              <SelectItem value="candidato">Candidato</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 shrink-0">
            <Button onClick={() => { setUserToEdit(null); setFormMode('convidar'); setIsFormOpen(true); }} variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Convidar
            </Button>
            <Button onClick={() => { setUserToEdit(null); setFormMode('criar'); setIsFormOpen(true); }} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Criar
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome e Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Nível (Role)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : paginatedUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.nome_completo}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.empresa_nome || 'Sem empresa'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={user.ativo} 
                      onCheckedChange={() => handleToggleStatus(user.id, user.ativo)}
                    />
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {user.ativo ? 'Ativo' : 'Inat.'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setUserToEdit(user); setIsFormOpen(true); }}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(user.id)}>
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
          totalItems={filteredUsers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {isFormOpen && (
        <FormUsuario
          user={userToEdit}
          mode={formMode}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); fetchData(); }} 
        />
      )}
    </div>
  )
}
