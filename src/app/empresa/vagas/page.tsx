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
import { Plus, Briefcase, CheckCircle, Edit, Trash, X, ArrowLeft } from 'lucide-react'
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ titulo: '', descricao: '', requisitos: '', categoria: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [vagaToDelete, setVagaToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadVagas = async () => {
    if (!user?.empresa_id) return
    const { data } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', user.empresa_id)
      .order('created_at', { ascending: false })
    setVagas(data || [])
    setLoading(false)
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
    loadVagas()
    setIsDetailsOpen(false)
  }

  const handleEditClick = (vaga: Vaga) => {
    setEditForm({
      titulo: vaga.titulo,
      descricao: vaga.descricao || '',
      requisitos: vaga.requisitos || '',
      categoria: vaga.categoria || '',
    })
    setIsEditMode(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedVaga) return
    setIsSaving(true)
    const { error } = await supabase.from('vagas').update(editForm).eq('id', selectedVaga.id)
    if (error) {
      toast.error('Erro ao salvar vaga')
      setIsSaving(false)
      return
    }
    toast.success('Vaga atualizada com sucesso!')
    setIsEditMode(false)
    loadVagas()
    setIsDetailsOpen(false)
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
              {vaga.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vaga.descricao}</p>}
              <p className="text-xs text-muted-foreground">Clique para mais detalhes</p>
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
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditMode(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <DialogTitle>Editar Vaga</DialogTitle>
              </div>
            ) : (
              <>
                <DialogTitle>{selectedVaga?.titulo}</DialogTitle>
                <DialogDescription>{selectedVaga?.categoria}</DialogDescription>
              </>
            )}
          </DialogHeader>

          {selectedVaga && (
            <div className="space-y-4">
              {isEditMode ? (
                <>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={editForm.titulo}
                      onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                      placeholder="Título da vaga"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input
                      value={editForm.categoria}
                      onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                      placeholder="Categoria"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={editForm.descricao}
                      onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                      placeholder="Descrição da vaga"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Requisitos</Label>
                    <Textarea
                      value={editForm.requisitos}
                      onChange={(e) => setEditForm({ ...editForm, requisitos: e.target.value })}
                      placeholder="Requisitos"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditMode(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{selectedVaga.descricao || 'Sem descrição'}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requisitos</h4>
                    <p className="text-sm text-muted-foreground">{selectedVaga.requisitos || 'Sem requisitos'}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Badge className={STATUS_COLORS[selectedVaga.status]}>
                      Status: {selectedVaga.status}
                    </Badge>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    {selectedVaga.status === 'rascunho' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(selectedVaga)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                          onClick={() => handleConfirm(selectedVaga.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(selectedVaga.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDetailsOpen(false)}
                      >
                        <X className="w-4 h-4 mr-2" /> Fechar
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
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
