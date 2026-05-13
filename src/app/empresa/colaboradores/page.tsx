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
import { Search, Plus, MoreHorizontal, Edit, Trash, FileCheck, Copy, CheckCheck, ExternalLink, X } from 'lucide-react'
import type { TemplateTeste } from '@/types/database'
import { toast, Toaster } from 'sonner'

interface TesteLink {
  id: string
  token: string
  respondido: boolean
  resultado: { D: number; I: number; S: number; C: number } | null
  created_at: string
  expires_at: string
  template_nome: string
}

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
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [selectedColabForTest, setSelectedColabForTest] = useState<Colaborador | null>(null)
  const [templates, setTemplates] = useState<TemplateTeste[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [gerandoLink, setGerandoLink] = useState(false)
  const [linkGerado, setLinkGerado] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [modalTab, setModalTab] = useState<'novo' | 'historico'>('novo')
  const [historico, setHistorico] = useState<TesteLink[]>([])
  const [historicoLoading, setHistoricoLoading] = useState(false)

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

  const openTestModal = async (colaborador: Colaborador) => {
    setSelectedColabForTest(colaborador)
    setSelectedTemplateId('')
    setLinkGerado(null)
    setCopiado(false)
    setModalTab('novo')
    setHistorico([])
    setIsTestModalOpen(true)

    const [templatesRes] = await Promise.all([
      fetch('/api/empresa/templates'),
      carregarHistorico(colaborador.id),
    ])
    setTemplatesLoading(true)
    try {
      if (templatesRes.ok) setTemplates(await templatesRes.json())
    } catch {
      toast.error('Erro ao carregar templates')
    } finally {
      setTemplatesLoading(false)
    }
  }

  const carregarHistorico = async (colaboradorId: string) => {
    setHistoricoLoading(true)
    try {
      const res = await fetch(`/api/colaboradores/${colaboradorId}/testes`)
      if (res.ok) setHistorico(await res.json())
    } catch {
      // silently ignore
    } finally {
      setHistoricoLoading(false)
    }
  }

  const gerarLink = async () => {
    if (!selectedColabForTest || !selectedTemplateId) return
    setGerandoLink(true)
    try {
      const res = await fetch(`/api/colaboradores/${selectedColabForTest.id}/gerar-teste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: selectedTemplateId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao gerar link')
        return
      }
      setLinkGerado(data.link)
      carregarHistorico(selectedColabForTest.id)
    } catch {
      toast.error('Erro ao gerar link')
    } finally {
      setGerandoLink(false)
    }
  }

  const copiarLink = () => {
    if (!linkGerado) return
    navigator.clipboard.writeText(linkGerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
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
    <>
      <Toaster />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground">{colaboradores.length} colaboradores</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
          onClick={() => { setColabToEdit(null); setIsFormOpen(true) }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
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
                      <DropdownMenuItem onClick={() => openTestModal(c)}>
                        <FileCheck className="mr-2 h-4 w-4" /> Aplicar Teste DISC
                      </DropdownMenuItem>
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

      {isTestModalOpen && selectedColabForTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-[460px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#1e2a5e]">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[#00D4FF]" />
                Aplicar Teste DISC
              </h2>
              <button
                onClick={() => { setIsTestModalOpen(false); setLinkGerado(null); setSelectedTemplateId('') }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1e2a5e]">
              <button
                onClick={() => setModalTab('novo')}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  modalTab === 'novo'
                    ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Novo Teste
              </button>
              <button
                onClick={() => setModalTab('historico')}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  modalTab === 'historico'
                    ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Histórico
                {historico.length > 0 && (
                  <span className="bg-[#1e2a5e] text-gray-300 text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                    {historico.length}
                  </span>
                )}
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Colaborador info */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#111633] border border-[#1e2a5e]">
                <div className="w-8 h-8 rounded-full bg-[#1e2a5e] flex items-center justify-center shrink-0 text-xs font-bold text-gray-300 uppercase">
                  {selectedColabForTest.nome.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-white truncate">{selectedColabForTest.nome}</p>
                  <p className="text-xs text-gray-400">{selectedColabForTest.cargo || 'Sem cargo'}</p>
                </div>
              </div>

              {modalTab === 'novo' ? (
                <>
                  {!linkGerado ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-white mb-2">Selecione o template</p>
                        {templatesLoading ? (
                          <p className="text-sm text-gray-400 py-3">Carregando templates...</p>
                        ) : templates.length === 0 ? (
                          <p className="text-sm text-gray-400 py-3">
                            Nenhum template cadastrado. Crie um em <strong className="text-white">Testes</strong>.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {templates.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setSelectedTemplateId(t.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                                  selectedTemplateId === t.id
                                    ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                                    : 'border-[#1e2a5e] bg-[#111633] hover:border-[#2a3a7e] hover:bg-[#151d40]'
                                }`}
                              >
                                <p className="font-medium text-white">{t.nome}</p>
                                {t.descricao && (
                                  <p className="text-xs text-gray-400 mt-0.5">{t.descricao}</p>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        disabled={!selectedTemplateId || gerandoLink}
                        onClick={gerarLink}
                        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          !selectedTemplateId || gerandoLink
                            ? 'bg-[#1e2a5e] text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:opacity-90'
                        }`}
                      >
                        {gerandoLink ? 'Gerando...' : 'Gerar Link do Teste'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-sm text-[#10B981]">
                        Link gerado! Compartilhe com <strong className="text-white">{selectedColabForTest.nome}</strong>.
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-gray-400">Link do teste</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0 bg-[#111633] rounded-lg px-3 py-2 text-xs font-mono truncate text-gray-300 border border-[#1e2a5e]">
                            {linkGerado}
                          </div>
                          <button onClick={copiarLink} className="p-2 border border-[#1e2a5e] text-gray-400 rounded-lg hover:bg-[#1e2a5e] hover:text-white transition-colors shrink-0" title="Copiar link">
                            {copiado ? <CheckCheck className="h-4 w-4 text-[#10B981]" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button onClick={() => window.open(linkGerado, '_blank', 'noopener,noreferrer')} className="p-2 border border-[#1e2a5e] text-gray-400 rounded-lg hover:bg-[#1e2a5e] hover:text-white transition-colors shrink-0" title="Abrir link">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        className="w-full text-sm text-gray-400 border border-[#1e2a5e] rounded-lg py-2.5 hover:bg-[#1e2a5e] hover:text-white transition-all"
                        onClick={() => { setLinkGerado(null); setSelectedTemplateId('') }}
                      >
                        Gerar novo link
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* Histórico */
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {historicoLoading ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Carregando histórico...</p>
                  ) : historico.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Nenhum teste aplicado ainda.</p>
                  ) : historico.map(item => {
                    const expirado = new Date(item.expires_at) < new Date()
                    const status = item.respondido ? 'respondido' : expirado ? 'expirado' : 'pendente'
                    const statusColors = {
                      respondido: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
                      pendente: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
                      expirado: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                    }
                    const statusLabel = { respondido: 'Respondido', pendente: 'Pendente', expirado: 'Expirado' }
                    return (
                      <div key={item.id} className="flex items-start justify-between gap-3 px-3 py-3 rounded-lg bg-[#111633] border border-[#1e2a5e]">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-white truncate">{item.template_nome}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {item.resultado && (
                            <div className="flex gap-2 mt-1.5">
                              {(['D','I','S','C'] as const).map(d => (
                                <span key={d} className="text-[10px] font-bold text-gray-400">
                                  {d}<span className="text-white ml-0.5">{item.resultado![d]}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[status]}`}>
                            {statusLabel[status]}
                          </span>
                          {!item.respondido && !expirado && (
                            <button
                              onClick={() => {
                                const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
                                navigator.clipboard.writeText(`${base}/testes/responder/${item.token}`)
                                toast.success('Link copiado!')
                              }}
                              className="p-1 text-gray-500 hover:text-[#00D4FF] transition-colors"
                              title="Copiar link"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <FormColaborador
          colaborador={colabToEdit}
          empresas={empresaAtual}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); fetchData() }}
          userRole={user?.role}
          userId={user?.id}
        />
      )}
      </div>
    </>
  )
}
