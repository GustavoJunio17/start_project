'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import type { Vaga, StatusVaga } from '@/types/database'
import { Plus, Briefcase, CheckCircle, Edit, Trash, X, ArrowLeft, FileText, ListChecks, Zap, Award, MapPin, DollarSign, Users, Calendar, Layers, Link2, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'

const supabase = createClient()

const ITEMS_PER_PAGE = 18

const STATUS_COLORS: Record<StatusVaga, string> = {
  rascunho: 'bg-blue-500/20 text-blue-400',
  aberta: 'bg-green-500/20 text-green-400',
  pausada: 'bg-yellow-500/20 text-yellow-400',
  encerrada: 'bg-red-500/20 text-red-400',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vagas</h1>
          <p className="text-muted-foreground">{vagas.length} vagas cadastradas</p>
        </div>
        <Link href="/empresa/vagas/nova">
          <Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
            <Plus className="w-4 h-4 mr-2" /> Nova Vaga
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Carregando...</p>
        ) : vagas.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Nenhuma vaga cadastrada ainda.</p>
        ) : paginated.map(vaga => (
          <Card
            key={vaga.id}
            className="bg-card border-border cursor-pointer hover:border-[#00D4FF] transition-colors"
            onClick={() => {
              setSelectedVaga(vaga)
              setIsDetailsOpen(true)
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-foreground">{vaga.titulo}</h3>
                </div>
                <Badge className={STATUS_COLORS[vaga.status]}>{vaga.status}</Badge>
              </div>
              {vaga.categoria && <Badge variant="outline" className="mb-2 text-xs">{vaga.categoria}</Badge>}
              <div className="mb-3">
                <p className="text-xs font-semibold text-white mb-1">Descrição</p>
                {vaga.descricao ? (
                  <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{vaga.descricao}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sem descrição</p>
                )}
              </div>
              <div
                className="flex items-center gap-2 mt-3 bg-secondary/40 border border-border rounded-md px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
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
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground hover:text-[#00D4FF]" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
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
                  <Badge className={`${STATUS_COLORS[selectedVaga.status]} w-fit`}>
                    {selectedVaga.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-2 bg-secondary/40 border border-border rounded-md px-3 py-2 mb-2">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
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

              <div className="space-y-5 py-4">
                {/* Descrição */}
                {selectedVaga.descricao && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm">Descrição</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {selectedVaga.descricao}
                    </p>
                  </div>
                )}

                {/* Requisitos */}
                {selectedVaga.requisitos && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm">Requisitos</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedVaga.requisitos.split('\n').filter(r => r.trim()).map((req, idx) => (
                        <div key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-[#00D4FF] font-bold mt-0.5">•</span>
                          <span>{req.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações de Contrato */}
                {(selectedVaga.modelo_trabalho || selectedVaga.regime || selectedVaga.salario || selectedVaga.quantidade_vagas || selectedVaga.departamento || selectedVaga.data_limite) && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm">Informações de Contrato</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedVaga.modelo_trabalho && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium">Modelo</span>
                          <p className="text-foreground font-medium">{selectedVaga.modelo_trabalho}</p>
                        </div>
                      )}
                      {selectedVaga.regime && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium">Regime</span>
                          <p className="text-foreground font-medium">{selectedVaga.regime}</p>
                        </div>
                      )}
                      {selectedVaga.quantidade_vagas && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" /> Qtd. Vagas
                          </span>
                          <p className="text-foreground font-medium">{selectedVaga.quantidade_vagas}</p>
                        </div>
                      )}
                      {selectedVaga.salario && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Salário
                          </span>
                          <p className="text-foreground font-medium">R$ {Number(selectedVaga.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      )}
                      {selectedVaga.departamento && (
                        <div className="space-y-1 col-span-2">
                          <span className="text-xs text-muted-foreground font-medium">Departamento</span>
                          <p className="text-foreground font-medium">{selectedVaga.departamento}</p>
                        </div>
                      )}
                      {selectedVaga.data_limite && (
                        <div className="space-y-1 col-span-2">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Data Limite
                          </span>
                          <p className="text-foreground font-medium">{new Date(selectedVaga.data_limite).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Especificações Técnicas */}
                {(selectedVaga.hard_skills?.length || selectedVaga.idiomas?.length || selectedVaga.escolaridade_minima) && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm">Especificações Técnicas</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedVaga.hard_skills?.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block mb-2">Hard Skills:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedVaga.hard_skills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedVaga.idiomas?.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block mb-2">Idiomas:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedVaga.idiomas.map((idioma: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">{idioma.idioma} • {idioma.nivel}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedVaga.escolaridade_minima && (
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block mb-1">Escolaridade Mínima:</span>
                          <p className="text-sm text-foreground">{selectedVaga.escolaridade_minima}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefícios e Diferenciais */}
                {(selectedVaga.beneficios?.length || selectedVaga.diferenciais) && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-[#00D4FF]" />
                      <h3 className="font-semibold text-sm">Benefícios & Diferenciais</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedVaga.beneficios?.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block mb-2">Benefícios:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedVaga.beneficios.map((beneficio: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">{beneficio}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedVaga.diferenciais && (
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block mb-2">Diferenciais:</span>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">{selectedVaga.diferenciais}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  {selectedVaga.status === 'rascunho' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setIsDetailsOpen(false)
                          window.location.href = `/empresa/vagas/${selectedVaga.id}/editar`
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                        onClick={() => handleConfirm(selectedVaga.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteClick(selectedVaga.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  ) : selectedVaga.status === 'aberta' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          handleStatusChange(selectedVaga.id, 'pausada')
                          setIsDetailsOpen(false)
                        }}
                      >
                        Pausar Vaga
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          handleStatusChange(selectedVaga.id, 'encerrada')
                          setIsDetailsOpen(false)
                        }}
                      >
                        Encerrar
                      </Button>
                    </>
                  ) : selectedVaga.status === 'pausada' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          handleStatusChange(selectedVaga.id, 'aberta')
                          setIsDetailsOpen(false)
                        }}
                      >
                        Reabrir Vaga
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          handleStatusChange(selectedVaga.id, 'encerrada')
                          setIsDetailsOpen(false)
                        }}
                      >
                        Encerrar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Fechar
                    </Button>
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
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja deletar este rascunho? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setVagaToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
