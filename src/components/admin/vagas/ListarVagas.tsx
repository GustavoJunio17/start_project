"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { Pagination } from "@/components/ui/pagination"
import { Briefcase, Search, Building2, Edit, Trash, CheckCircle, FileText, ListChecks, Zap, Award, Layers, Users, DollarSign, Calendar, Link2, Check } from "lucide-react"
import type { Vaga, Empresa, StatusVaga } from "@/types/database"
import { FormVaga } from "./FormVaga"
import { toast } from "sonner"

const supabase = createClient()

const ITEMS_PER_PAGE = 18

const STATUS_COLORS: Record<StatusVaga, string> = {
  rascunho: 'bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/20',
  aberta: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  pausada: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
  encerrada: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
}

export function ListarVagas() {
  const [vagas, setVagas] = useState<(Vaga & { empresa: { nome: string } })[]>([])
  const [empresas, setEmpresas] = useState<Pick<Empresa, 'id' | 'nome'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [empresaFilter, setEmpresaFilter] = useState<string>('todas')
  const [page, setPage] = useState(1)

  const [selectedVaga, setSelectedVaga] = useState<(Vaga & { empresa: { nome: string } }) | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [vagaToEdit, setVagaToEdit] = useState<Vaga | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [vagaToDelete, setVagaToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: vagasData } = await supabase
      .from('vagas')
      .select('*, empresa:empresas(nome)')
      .order('created_at', { ascending: false })
    setVagas(vagasData || [])

    const { data: empresasData } = await supabase
      .from('empresas')
      .select('id, nome')
      .order('nome')
    setEmpresas(empresasData || [])

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const copyLink = (e: React.MouseEvent, vagaId: string) => {
    e.stopPropagation()
    const url = `${window.location.origin}/vagas/${vagaId}`
    navigator.clipboard.writeText(url)
    setCopiedId(vagaId)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleConfirm = async (id: string) => {
    const { error } = await supabase.from('vagas').update({ status: 'aberta' }).eq('id', id)
    if (error) { toast.error('Erro ao confirmar vaga'); return }
    toast.success('Vaga confirmada com sucesso!')
    setIsDetailsOpen(false)
    fetchData()
  }

  const handleStatusChange = async (vagaId: string, newStatus: StatusVaga) => {
    const { error } = await supabase.from('vagas').update({ status: newStatus }).eq('id', vagaId)
    if (error) { toast.error('Erro ao atualizar status da vaga'); return }
    const label = newStatus === 'aberta' ? 'reaberta' : newStatus === 'pausada' ? 'pausada' : 'encerrada'
    toast.success(`Vaga ${label} com sucesso!`)
    setIsDetailsOpen(false)
    fetchData()
  }

  const handleDeleteClick = (id: string) => {
    setVagaToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!vagaToDelete) return
    setIsDeleting(true)
    const { error } = await supabase.from('vagas').delete().eq('id', vagaToDelete)
    if (error) { toast.error('Erro ao deletar vaga'); setIsDeleting(false); return }
    toast.success('Vaga deletada com sucesso!')
    setShowDeleteConfirm(false)
    setVagaToDelete(null)
    setSelectedVaga(null)
    setIsDetailsOpen(false)
    fetchData()
    setIsDeleting(false)
  }

  const filteredVagas = vagas.filter(v => {
    const matchesSearch = v.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (v.categoria && v.categoria.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'todos' || v.status === statusFilter
    const matchesEmpresa = empresaFilter === 'todas' || v.empresa_id === empresaFilter
    return matchesSearch && matchesStatus && matchesEmpresa
  })

  useEffect(() => setPage(1), [search, statusFilter, empresaFilter])

  const totalPages = Math.ceil(filteredVagas.length / ITEMS_PER_PAGE)
  const paginatedVagas = filteredVagas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center">
        <div className="relative w-full xl:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            placeholder="Buscar por título ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select 
              value={empresaFilter} 
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="w-[200px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todas" className="text-gray-300">Todas as Empresas</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id} className="text-white">
                  {e.nome}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[160px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todos" className="text-gray-300">Todos Status</option>
              <option value="rascunho" className="text-white">Rascunho</option>
              <option value="aberta" className="text-white">Aberta</option>
              <option value="pausada" className="text-white">Pausada</option>
              <option value="encerrada" className="text-white">Encerrada</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 xl:ml-auto shrink-0">
          {filteredVagas.length} vaga{filteredVagas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-400 col-span-full text-center py-12">Carregando...</p>
        ) : filteredVagas.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center py-12">Nenhuma vaga encontrada.</p>
        ) : paginatedVagas.map(vaga => (
          <div
            key={vaga.id}
            className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5 cursor-pointer hover:border-[#00D4FF]/40 transition-colors"
            onClick={() => { setSelectedVaga(vaga); setIsDetailsOpen(true) }}
          >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="w-4 h-4 text-[#00D4FF] shrink-0" />
                  <h3 className="font-semibold text-white truncate">{vaga.titulo}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-2 ${STATUS_COLORS[vaga.status]}`}>{vaga.status}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{vaga.empresa?.nome || '—'}</span>
              </div>

              {vaga.categoria && (
                <span className="inline-flex items-center mb-2 px-2 py-0.5 rounded-full text-xs border border-[#1e2a5e] text-gray-400">{vaga.categoria}</span>
              )}

              <div className="mb-3">
                {vaga.descricao ? (
                  <p className="text-sm text-gray-400 line-clamp-2 whitespace-pre-wrap">{vaga.descricao}</p>
                ) : (
                  <p className="text-sm text-gray-600 italic">Sem descrição</p>
                )}
              </div>

              <div
                className="flex items-center gap-2 mt-3 bg-[#0A0E27] border border-[#1e2a5e] rounded-md px-3 py-2"
                onClick={e => e.stopPropagation()}
              >
                <Link2 className="w-3 h-3 text-gray-500 shrink-0" />
                <span className="text-xs text-gray-600 truncate flex-1 font-mono">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/vagas/${vaga.id}`}
                </span>
                <button
                  onClick={e => copyLink(e, vaga.id)}
                  className="shrink-0 p-1 rounded hover:bg-[#00D4FF]/10 transition-colors"
                  title="Copiar link"
                >
                  {copiedId === vaga.id
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <Link2 className="w-3.5 h-3.5 text-gray-500 hover:text-[#00D4FF]" />
                  }
                </button>
              </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredVagas.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      {/* Modal de Detalhes */}
      {isDetailsOpen && selectedVaga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#1e2a5e]">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-white">{selectedVaga.titulo}</h2>
                <p className="text-base text-gray-400">{selectedVaga.categoria || 'Sem categoria'}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${STATUS_COLORS[selectedVaga.status]}`}>{selectedVaga.status}</span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>{selectedVaga.empresa?.nome || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="flex items-center gap-2 bg-[#111633] border border-[#1e2a5e] rounded-md px-3 py-2 mb-2">
                <Link2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="text-xs text-gray-600 truncate flex-1 font-mono">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/vagas/${selectedVaga.id}`}
                </span>
                <button
                  onClick={e => copyLink(e, selectedVaga.id)}
                  className="shrink-0 p-1 rounded hover:bg-[#00D4FF]/10 transition-colors"
                  title="Copiar link"
                >
                  {copiedId === selectedVaga.id
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <Link2 className="w-3.5 h-3.5 text-gray-400 hover:text-[#00D4FF]" />
                  }
                </button>
              </div>

              {selectedVaga.descricao && (
                <div className="bg-[#111633] rounded-lg p-4 border border-[#1e2a5e]">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#00D4FF]" />
                    <h3 className="font-semibold text-sm text-white">Descrição</h3>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedVaga.descricao}
                  </p>
                </div>
              )}

              {selectedVaga.requisitos && (
                <div className="bg-[#111633] rounded-lg p-4 border border-[#1e2a5e]">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-[#00D4FF]" />
                    <h3 className="font-semibold text-sm text-white">Requisitos</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedVaga.requisitos.split('\n').filter(r => r.trim()).map((req, idx) => (
                      <div key={idx} className="flex gap-2 text-sm text-gray-400">
                        <span className="text-[#00D4FF] font-bold mt-0.5">•</span>
                        <span>{req.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedVaga.modelo_trabalho || selectedVaga.regime || selectedVaga.salario || selectedVaga.quantidade_vagas || selectedVaga.departamento || selectedVaga.data_limite) && (
                <div className="bg-[#111633] rounded-lg p-4 border border-[#1e2a5e]">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[#00D4FF]" />
                    <h3 className="font-semibold text-sm text-white">Informações de Contrato</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedVaga.modelo_trabalho && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium">Modelo</span>
                        <p className="text-gray-300 font-medium">{selectedVaga.modelo_trabalho}</p>
                      </div>
                    )}
                    {selectedVaga.regime && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium">Regime</span>
                        <p className="text-gray-300 font-medium">{selectedVaga.regime}</p>
                      </div>
                    )}
                    {selectedVaga.quantidade_vagas && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Users className="w-3 h-3" /> Qtd. Vagas
                        </span>
                        <p className="text-gray-300 font-medium">{selectedVaga.quantidade_vagas}</p>
                      </div>
                    )}
                    {selectedVaga.salario && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Salário
                        </span>
                        <p className="text-gray-300 font-medium">
                          R$ {Number(selectedVaga.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {selectedVaga.departamento && (
                      <div className="space-y-1 col-span-2">
                        <span className="text-xs text-gray-500 font-medium">Departamento</span>
                        <p className="text-gray-300 font-medium">{selectedVaga.departamento}</p>
                      </div>
                    )}
                    {selectedVaga.data_limite && (
                      <div className="space-y-1 col-span-2">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Data Limite
                        </span>
                        <p className="text-gray-300 font-medium">
                          {new Date(selectedVaga.data_limite).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedVaga.hard_skills?.length || selectedVaga.idiomas?.length || selectedVaga.escolaridade_minima) && (
                <div className="bg-[#111633] rounded-lg p-4 border border-[#1e2a5e]">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-[#00D4FF]" />
                    <h3 className="font-semibold text-sm text-white">Especificações Técnicas</h3>
                  </div>
                  <div className="space-y-3">
                    {(selectedVaga.hard_skills?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-2">Hard Skills:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedVaga.hard_skills!.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedVaga.idiomas?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-2">Idiomas:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedVaga.idiomas!.map((idioma, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                              {idioma.idioma} • {idioma.nivel}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedVaga.escolaridade_minima && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-1">Escolaridade Mínima:</span>
                        <p className="text-sm text-gray-300">{selectedVaga.escolaridade_minima}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedVaga.beneficios?.length || selectedVaga.diferenciais) && (
                <div className="bg-[#111633] rounded-lg p-4 border border-[#1e2a5e]">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-[#00D4FF]" />
                    <h3 className="font-semibold text-sm text-white">Benefícios & Diferenciais</h3>
                  </div>
                  <div className="space-y-3">
                    {(selectedVaga.beneficios?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-2">Benefícios:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedVaga.beneficios!.map((b, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">{b}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedVaga.diferenciais && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-2">Diferenciais:</span>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap break-words leading-relaxed">{selectedVaga.diferenciais}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1e2a5e]">
                {selectedVaga.status === 'rascunho' ? (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                      onClick={() => { setVagaToEdit(selectedVaga); setIsDetailsOpen(false); setIsFormOpen(true) }}>
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
                      onClick={() => handleConfirm(selectedVaga.id)}>
                      <CheckCircle className="w-4 h-4" /> Confirmar
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all"
                      onClick={() => handleDeleteClick(selectedVaga.id)}>
                      <Trash className="w-4 h-4" /> Deletar
                    </button>
                  </>
                ) : selectedVaga.status === 'aberta' ? (
                  <>
                    <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                      onClick={() => handleStatusChange(selectedVaga.id, 'pausada')}>Pausar Vaga</button>
                    <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                      onClick={() => handleStatusChange(selectedVaga.id, 'encerrada')}>Encerrar</button>
                  </>
                ) : selectedVaga.status === 'pausada' ? (
                  <>
                    <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                      onClick={() => handleStatusChange(selectedVaga.id, 'aberta')}>Reabrir Vaga</button>
                    <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                      onClick={() => handleStatusChange(selectedVaga.id, 'encerrada')}>Encerrar</button>
                  </>
                ) : (
                  <button className="w-full flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                    onClick={() => setIsDetailsOpen(false)}>Fechar</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação de Deleção */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-[400px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Deletar Rascunho</h2>
            <p className="text-sm text-gray-400 mb-6">
              Tem certeza que deseja deletar este rascunho? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowDeleteConfirm(false); setVagaToDelete(null) }} disabled={isDeleting}
                className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={isDeleting}
                className="px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all disabled:opacity-50">
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <FormVaga
          vaga={vagaToEdit}
          empresas={empresas}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); fetchData() }}
        />
      )}
    </div>
  )
}
