"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { Trash, Search } from "lucide-react"
import type { User } from "@/types/database"
import { Pagination } from "@/components/ui/pagination"
import { CandidatoDrawer } from "./CandidatoDrawer"

const ITEMS_PER_PAGE = 20

export function ListarCandidatos() {
  const [candidatos, setCandidatos] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<User | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'candidato')
      .order('created_at', { ascending: false })
    setCandidatos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este candidato?')) return
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir candidato: ' + error.message)
      return
    }
    if (selected?.id === id) setSelected(null)
    fetchData()
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('users').update({ ativo: !currentStatus }).eq('id', id)
    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      return
    }
    setCandidatos(prev => prev.map(u => u.id === id ? { ...u, ativo: !currentStatus } : u))
    setSelected(prev => prev?.id === id ? { ...prev, ativo: !currentStatus } : prev)
  }

  const filtered = candidatos.filter(u => {
    const matchesSearch =
      u.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && u.ativo) ||
      (statusFilter === 'inativo' && !u.ativo)
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => setPage(1), [search, statusFilter])

  return (
    <>
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

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[140px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todos" className="text-gray-300">Todos Status</option>
              <option value="ativo" className="text-white">Ativos</option>
              <option value="inativo" className="text-white">Inativos</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a5e]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nome e Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Data Cadastro</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[80px]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Carregando candidatos...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Nenhum candidato encontrado.</td>
                </tr>
              ) : paginated.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0 cursor-pointer"
                  onClick={() => setSelected(user)}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-white">{user.nome_completo}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
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
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
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
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <CandidatoDrawer
        user={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onToggleStatus={handleToggleStatus}
      />
    </>
  )
}
