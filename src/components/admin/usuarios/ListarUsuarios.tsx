"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { Search, Building2, Edit, Trash, UserPlus, MoreHorizontal } from "lucide-react"
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
    if (u.role === 'candidato') return false
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

  const getRoleBadgeClasses = (role: Role) => {
    switch(role) {
      case 'super_admin': return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
      case 'super_gestor': return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
      case 'admin': return 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20'
      case 'gestor_rh': return 'bg-[#7B2FFF]/10 text-[#7B2FFF] border border-[#7B2FFF]/20'
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="relative w-full xl:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
          <div className="relative">
            <select 
              value={empresaFilter} 
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="w-[200px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todas" className="text-gray-300">Todas as Empresas</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id} className="text-white">
                  {empresa.nome}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-[140px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todos" className="text-gray-300">Todos Níveis</option>
              <option value="super_admin" className="text-white">Super Admin</option>
              <option value="admin" className="text-white">Admin</option>
              <option value="gestor_rh" className="text-white">Gestor RH</option>
              <option value="colaborador" className="text-white">Colaborador</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[130px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todos" className="text-gray-300">Todos Status</option>
              <option value="ativo" className="text-white">Ativos</option>
              <option value="inativo" className="text-white">Inativos</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button onClick={() => { setUserToEdit(null); setFormMode('convidar'); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all">
              <UserPlus className="h-4 w-4" />
              Convidar
            </button>
            <button onClick={() => { setUserToEdit(null); setFormMode('criar'); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all">
              <UserPlus className="h-4 w-4" />
              Criar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nome e Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nível (Role)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Data Cadastro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[80px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Carregando usuários...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : paginatedUsers.map(user => (
              <tr key={user.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5">
                  <div className="font-medium text-white">{user.nome_completo}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-sm text-gray-400">{user.empresa_nome || 'Sem empresa'}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user.id, user.ativo)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.ativo ? 'bg-[#00D4FF]' : 'bg-gray-600'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.ativo ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs text-gray-500">
                      {user.ativo ? 'Ativo' : 'Inat.'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setUserToEdit(user); setIsFormOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1e2a5e]/50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
