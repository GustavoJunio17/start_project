'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import type { Vaga, StatusVaga } from '@/types/database'
import { Plus, Briefcase, CheckCircle, Edit, Trash, FileText, ListChecks, Zap, Award, DollarSign, Users, Calendar, Layers, Link2, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { toast } from 'sonner'

const supabase = createClient()

const ITEMS_PER_PAGE = 18

const STATUS_COLORS: Record<StatusVaga, string> = {
  rascunho: 'bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/20',
  aberta: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  pausada: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
  encerrada: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
}

export default function VagasPage() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [vagaToDelete, setVagaToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyLink = (e: React.MouseEvent, vagaId: string) => {
    e.stopPropagation()
    const url = `${window.location.origin}/vagas/${vagaId}`
    navigator.clipboard.writeText(url)
    setCopiedId(vagaId)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const loadVagas = async () => {
    if (!user?.empresa_id) return
    try {
      const res = await fetch('/api/empresa/vagas')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setVagas(data || [])
    } catch (error) {
      console.error('Erro ao carregar vagas:', error)
      setVagas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVagas() }, [user])

  const handleConfirm = async (id: string) => {
    const { error } = await supabase.from('vagas').update({ status: 'aberta' }).eq('id', id)
    if (error) {
      toast.error('Erro ao confirmar vaga')
      return
    }
    toast.success('Vaga confirmada com sucesso!')
    loadVagas()
    setIsDetailsOpen(false)
  }

  const handleDeleteClick = (id: string) => {
    setVagaToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!vagaToDelete) return
    setIsDeleting(true)
    const { error } = await supabase.from('vagas').delete().eq('id', vagaToDelete)
    if (error) {
      toast.error('Erro ao deletar vaga')
      setIsDeleting(false)
      return
    }
    toast.success('Vaga deletada com sucesso!')
    setShowDeleteConfirm(false)
    setVagaToDelete(null)
    setSelectedVaga(null)
    setIsDetailsOpen(false)
    loadVagas()
  }

  const handleStatusChange = async (vagaId: string, newStatus: StatusVaga) => {
    const { error } = await supabase.from('vagas').update({ status: newStatus }).eq('id', vagaId)
    if (error) {
      toast.error('Erro ao atualizar status da vaga')
      return
    }
    toast.success(`Vaga ${newStatus === 'aberta' ? 'reaberta' : newStatus === 'pausada' ? 'pausada' : 'encerrada'} com sucesso!`)
    loadVagas()
  }


  const totalPages = Math.ceil(vagas.length / ITEMS_PER_PAGE)
  const paginated = vagas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Vagas</h1>
        <p className="text-gray-400 text-sm mt-1">{vagas.length} vagas cadastradas</p>
      </div>
        <Link href="/empresa/vagas/nova">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> Nova Vaga
          </button>
        </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center py-8">Carregando...</p>
        ) : vagas.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">Nenhuma vaga cadastrada ainda.</p>
        ) : paginated.map(vaga => (
          <div
            key={vaga.id}
            className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5 cursor-pointer hover:border-[#00D4FF]/40 transition-colors"
            onClick={() => { setSelectedVaga(vaga); setIsDetailsOpen(true) }}
          >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-white">{vaga.titulo}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[vaga.status]}`}>{vaga.status}</span>
              </div>
              {vaga.categoria && <span className="inline-flex items-center mb-2 px-2 py-0.5 rounded-full text-xs border border-[#1e2a5e] text-gray-400">{vaga.categoria}</span>}
              <div className="mb-3">
                <p className="text-xs font-semibold text-white mb-1">Descrição</p>
                {vaga.descricao ? (
                  <p className="text-sm text-gray-400 line-clamp-2 whitespace-pre-wrap">{vaga.descricao}</p>
                ) : (
                  <p className="text-sm text-gray-600 italic">Sem descrição</p>
                )}
              </div>
              <div
                className="flex items-center gap-2 mt-3 bg-[#0A0E27] border border-[#1e2a5e] rounded-md px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Link2 className="w-3 h-3 text-gray-500 shrink-0" />
                <span className="text-xs text-gray-600 truncate flex-1 font-mono">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/vagas/${vaga.id}`}
                </span>
                <button
                  onClick={(e) => copyLink(e, vaga.id)}
                  className="shrink-0 p-1 rounded hover:bg-[#00D4FF]/10 transition-colors"
                  title="Copiar link"
                >
                  {copiedId === vaga.id ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 text-gray-500 hover:text-[#00D4FF]" />
                  )}
                </button>
              </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={vagas.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          {selectedVaga && (
            <>
              <DialogHeader className="mb-4">
                <div className="flex flex-col gap-3">
                  <DialogTitle className="text-2xl">{selectedVaga?.titulo}</DialogTitle>
                  <DialogDescription className="text-base">{selectedVaga?.categoria || 'Sem categoria'}</DialogDescription>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${STATUS_COLORS[selectedVaga.status]}`}>
                    {selectedVaga.status}
                  </span>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-2 bg-[#0A0E27] border border-[#1e2a5e] rounded-md px-3 py-2 mb-2">
                <Link2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="text-xs text-gray-600 truncate flex-1 font-mono">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/vagas/${selectedVaga.id}`}
                </span>
                <button
                  onClick={(e) => copyLink(e, selectedVaga.id)}
                  className="shrink-0 p-1 rounded hover:bg-[#00D4FF]/10 transition-colors"
                  title="Copiar link"
                >
                  {copiedId === selectedVaga.id ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground hover:text-[#00D4FF]" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {selectedVaga.descricao && (
                  <div className="bg-[#0A0E27] rounded-lg p-4 border border-[#1e2a5e]">
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
                  <div className="bg-[#0A0E27] rounded-lg p-4 border border-[#1e2a5e]">
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
                  <div className="bg-[#0A0E27] rounded-lg p-4 border border-[#1e2a5e]">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm text-white">Informações de Contrato</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedVaga.modelo_trabalho && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 font-medium">Modelo</span>
                          <p className="text-white font-medium">{selectedVaga.modelo_trabalho}</p>
                        </div>
                      )}
                      {selectedVaga.regime && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 font-medium">Regime</span>
                          <p className="text-white font-medium">{selectedVaga.regime}</p>
                        </div>
                      )}
                      {selectedVaga.quantidade_vagas && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Users className="w-3 h-3" /> Qtd. Vagas</span>
                          <p className="text-white font-medium">{selectedVaga.quantidade_vagas}</p>
                        </div>
                      )}
                      {selectedVaga.salario && (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" /> Salário</span>
                          <p className="text-white font-medium">R$ {Number(selectedVaga.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      )}
                      {selectedVaga.departamento && (
                        <div className="space-y-1 col-span-2">
                          <span className="text-xs text-gray-500 font-medium">Departamento</span>
                          <p className="text-white font-medium">{selectedVaga.departamento}</p>
                        </div>
                      )}
                      {selectedVaga.data_limite && (
                        <div className="space-y-1 col-span-2">
                          <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Data Limite</span>
                          <p className="text-white font-medium">{new Date(selectedVaga.data_limite).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(selectedVaga.hard_skills?.length || selectedVaga.idiomas?.length || selectedVaga.escolaridade_minima) && (
                  <div className="bg-[#0A0E27] rounded-lg p-4 border border-[#1e2a5e]">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm text-white">Especificações Técnicas</h3>
                    </div>
                    <div className="space-y-3">
                      {(selectedVaga.hard_skills?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium block mb-2">Hard Skills:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedVaga.hard_skills?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(selectedVaga.idiomas?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium block mb-2">Idiomas:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedVaga.idiomas?.map((idioma: any, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">{idioma.idioma} • {idioma.nivel}</span>
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
                  <div className="bg-[#0A0E27] rounded-lg p-4 border border-[#1e2a5e]">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm text-white">Benefícios &amp; Diferenciais</h3>
                    </div>
                    <div className="space-y-3">
                      {(selectedVaga.beneficios?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium block mb-2">Benefícios:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedVaga.beneficios?.map((beneficio: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">{beneficio}</span>
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

                <div className="flex gap-2 pt-4 border-t border-[#1e2a5e]">
                  {selectedVaga.status === 'rascunho' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                        onClick={() => { setIsDetailsOpen(false); window.location.href = `/empresa/vagas/${selectedVaga.id}/editar` }}>
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
                        onClick={() => handleConfirm(selectedVaga.id)}>
                        <CheckCircle className="w-4 h-4" /> Confirmar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all"
                        onClick={() => handleDeleteClick(selectedVaga.id)}>
                        <Trash className="w-4 h-4" /> Cancelar
                      </button>
                    </>
                  ) : selectedVaga.status === 'aberta' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                        onClick={() => { handleStatusChange(selectedVaga.id, 'pausada'); setIsDetailsOpen(false) }}>Pausar Vaga</button>
                      <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                        onClick={() => { handleStatusChange(selectedVaga.id, 'encerrada'); setIsDetailsOpen(false) }}>Encerrar</button>
                    </>
                  ) : selectedVaga.status === 'pausada' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                        onClick={() => { handleStatusChange(selectedVaga.id, 'aberta'); setIsDetailsOpen(false) }}>Reabrir Vaga</button>
                      <button className="flex-1 flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                        onClick={() => { handleStatusChange(selectedVaga.id, 'encerrada'); setIsDetailsOpen(false) }}>Encerrar</button>
                    </>
                  ) : (
                    <button className="w-full flex items-center justify-center px-3 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                      onClick={() => setIsDetailsOpen(false)}>Fechar</button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Deleção */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Deletar Rascunho</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">
            Tem certeza que deseja deletar este rascunho? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => { setShowDeleteConfirm(false); setVagaToDelete(null) }} disabled={isDeleting}
              className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={confirmDelete} disabled={isDeleting}
              className="px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all disabled:opacity-50">
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
