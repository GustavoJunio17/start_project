'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCargosEDepartamentos } from '@/hooks/useCargosEDepartamentos'
import { createClient } from '@/lib/db/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, CheckCircle, ThumbsDown, Star, MoreVertical, X, Link2, Copy, Eye, EyeOff, RefreshCw, UserCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast, Toaster } from 'sonner'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Candidato, Vaga } from '@/types/database'

type CandidatoAvaliado = Candidato

const supabase = createClient()

interface Candidatura {
  id: string
  nome: string
  email: string
  telefone: string
  status: 'pendente' | 'lido' | 'rejeito' | 'contratado' | 'banco_talentos'
  vaga_titulo: string
  vaga_id: string
  vaga_cargo?: string
  vaga_departamento?: string
  vaga_salario?: number
  created_at: string
  mensagem?: string
  linkedin?: string
  pretensao_salarial?: string
  curriculo_nome?: string
  candidato_id?: string
}

interface Template {
  id: string
  nome: string
}

const ITEMS_PER_PAGE = 20
const TABS = ['pendente', 'contratado', 'rejeito', 'banco_talentos'] as const
type TabType = typeof TABS[number]

export default function CandidatosPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const { cargos, departamentos, loading: cargosDeptLoading } = useCargosEDepartamentos(user?.empresa_id)
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVaga, setFilterVaga] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('pendente')
  const [page, setPage] = useState(1)
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [candidaturaForTest, setCandidaturaForTest] = useState<Candidatura | null>(null)
  const [testLink, setTestLink] = useState('')
  const [showTestLink, setShowTestLink] = useState(false)
  const [testeLinksExistentes, setTesteLinksExistentes] = useState<{ id: string; token: string; respondido: boolean; created_at: string; template_nome: string; expires_at: string }[]>([])
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [candidaturaForApproval, setCandidaturaForApproval] = useState<Candidatura | null>(null)
  const [formData, setFormData] = useState({
    data_contratacao: new Date().toISOString().split('T')[0],
    departamento: '',
    cargo: '',
    modelo_trabalho: 'presencial',
    regime_contrato: 'CLT',
    salario: '',
    criar_conta: true,
    email_conta: '',
    senha_conta: '',
  })
  const [showSenhaConta, setShowSenhaConta] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)
  const [candidaturaForAction, setCandidaturaForAction] = useState<Candidatura | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [candidatosAvaliados, setCandidatosAvaliados] = useState<CandidatoAvaliado[]>([])
  const [selectedCandidatoAvaliado, setSelectedCandidatoAvaliado] = useState<CandidatoAvaliado | null>(null)
  const [isCandidatoOpen, setIsCandidatoOpen] = useState(false)
  const [gestorDepartamentos, setGestorDepartamentos] = useState<string[]>([])
  const [candidatoAvaliadoForAction, setCandidatoAvaliadoForAction] = useState<CandidatoAvaliado | null>(null)
  const [isAvaliadoActionsOpen, setIsAvaliadoActionsOpen] = useState(false)

  const verId = searchParams.get('ver')

  useEffect(() => {
    if (!user?.empresa_id) return

    const gestorSetoresPromise = user.role === 'gestor_rh'
      ? supabase.from('gestor_rh_setores').select('cargos_departamento_id').eq('user_id', user.id!)
      : Promise.resolve({ data: null as null })

    Promise.all([
      fetch('/api/candidaturas/empresa').then(r => r.json()),
      fetch('/api/empresa/templates').then(r => r.json()),
      supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo, departamento)')
        .eq('empresa_id', user.empresa_id)
        .order('match_score', { ascending: false, nullsFirst: false }),
      gestorSetoresPromise,
    ]).then(async ([candidaturas, templates, candRes, setoresRes]) => {
      const loaded: Candidatura[] = Array.isArray(candidaturas) ? candidaturas : []
      setCandidaturas(loaded)
      setTemplates(Array.isArray(templates) ? templates : [])
      setCandidatosAvaliados(candRes.data || [])
      setLoading(false)

      if (setoresRes.data && setoresRes.data.length > 0) {
        const ids = setoresRes.data.map((s: any) => s.cargos_departamento_id)
        const deptRes = await supabase.from('cargos_departamentos').select('nome').in('id', ids)
        if (deptRes.data) setGestorDepartamentos(deptRes.data.map((d: any) => d.nome))
      }

      if (verId) {
        const candidatura = loaded.find(c => c.candidato_id === verId)
        if (candidatura) { setSelectedCandidatura(candidatura); setIsOpen(true) }
        else {
          const cand = (candRes.data || []).find((c: CandidatoAvaliado) => c.id === verId)
          if (cand) { setSelectedCandidatoAvaliado(cand); setIsCandidatoOpen(true) }
        }
      }
    }).catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const vagas = [...new Set(candidaturas.map(c => c.vaga_titulo))].filter(Boolean)
  const isGestorRH = user?.role === 'gestor_rh'

  const filtered = candidaturas.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase())
    const matchVaga = !filterVaga || c.vaga_titulo === filterVaga
    const matchStatus = c.status === activeTab
    const matchDept = !isGestorRH || gestorDepartamentos.length === 0 || gestorDepartamentos.includes(c.vaga_departamento || '')
    return matchSearch && matchVaga && matchStatus && matchDept
  })

  // Mapear status de candidatos para abas
  const filteredAvaliados = candidatosAvaliados.filter(c => {
    const matchSearch = c.nome_completo.toLowerCase().includes(search.toLowerCase())
    const matchVaga = !filterVaga || (c.vaga as Vaga)?.titulo === filterVaga
    let matchTab = false
    if (activeTab === 'pendente') matchTab = c.status_candidatura === 'inscrito' || c.status_candidatura === 'em_avaliacao'
    if (activeTab === 'contratado') matchTab = c.status_candidatura === 'aprovado' || c.status_candidatura === 'contratado'
    if (activeTab === 'rejeito') matchTab = c.status_candidatura === 'reprovado'
    if (activeTab === 'banco_talentos') matchTab = c.disponivel_banco_talentos
    const matchDept = !isGestorRH || gestorDepartamentos.length === 0 || gestorDepartamentos.includes((c.vaga as any)?.departamento || '')
    return matchSearch && matchVaga && matchTab && matchDept
  })

  useEffect(() => setPage(1), [search, filterVaga, activeTab])

  useEffect(() => {
    if (isTestModalOpen && candidaturaForTest?.id) {
      fetch(`/api/testes/links?candidatura_id=${candidaturaForTest.id}`)
        .then(r => r.json()).then(setTesteLinksExistentes).catch(() => {})
    }
  }, [isTestModalOpen, candidaturaForTest?.id])

  const handleReject = async () => {
    if (!candidaturaForAction) return
    setActionLoading(true)

    try {
      const res = await fetch('/api/candidaturas/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidatura_id: candidaturaForAction.id, status: 'rejeito' }),
      })

      if (res.ok) {
        setCandidaturas(prev =>
          prev.map(c => (c.id === candidaturaForAction.id ? { ...c, status: 'rejeito' } : c))
        )
        setIsActionsModalOpen(false)
        toast.success('Candidato rejeitado')
      } else {
        toast.error('Erro ao rejeitar candidato')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleTalentBank = async () => {
    if (!candidaturaForAction) return
    setActionLoading(true)

    try {
      const res = await fetch('/api/candidaturas/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatura_id: candidaturaForAction.id,
          status: 'banco_talentos',
        }),
      })

      if (res.ok) {
        setCandidaturas(prev =>
          prev.map(c => (c.id === candidaturaForAction.id ? { ...c, status: 'banco_talentos' } : c))
        )
        setIsActionsModalOpen(false)
        toast.success('Candidato movido para banco de talentos')
      } else {
        toast.error('Erro ao mover para banco de talentos')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleBackToPending = async () => {
    if (!candidaturaForAction) return
    setActionLoading(true)

    try {
      const res = await fetch('/api/candidaturas/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatura_id: candidaturaForAction.id,
          status: 'pendente',
        }),
      })

      if (res.ok) {
        setCandidaturas(prev =>
          prev.map(c => (c.id === candidaturaForAction.id ? { ...c, status: 'pendente' } : c))
        )
        setIsActionsModalOpen(false)
        toast.success('Candidato voltou para pendentes')
      } else {
        toast.error('Erro ao voltar para pendentes')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCandidatura = async () => {
    if (!candidaturaForAction) return
    if (!confirm('Tem certeza que deseja excluir esta candidatura? Esta ação não pode ser desfeita.')) {
      return
    }
    setActionLoading(true)

    try {
      const res = await fetch(`/api/candidaturas/status?id=${candidaturaForAction.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setCandidaturas(prev => prev.filter(c => c.id !== candidaturaForAction.id))
        setIsActionsModalOpen(false)
        toast.success('Candidatura excluída com sucesso')
      } else {
        toast.error('Erro ao excluir candidatura')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleAvaliadoStatusChange = async (newStatus: string) => {
    if (!candidatoAvaliadoForAction) return
    await supabase.from('candidatos').update({ status_candidatura: newStatus }).eq('id', candidatoAvaliadoForAction.id)
    setCandidatosAvaliados(prev =>
      prev.map(c => c.id === candidatoAvaliadoForAction.id ? { ...c, status_candidatura: newStatus as any } : c)
    )
    setIsAvaliadoActionsOpen(false)
    toast.success('Status atualizado')
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDownload = async (id: string, nome: string) => {
    const res = await fetch(`/api/candidaturas/${id}/curriculo`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `curriculo-${nome}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenApprovalModal = (c: Candidatura) => {
    setCandidaturaForApproval(c)
    setFormData({
      data_contratacao: new Date().toISOString().split('T')[0],
      departamento: c.vaga_departamento || '',
      cargo: c.vaga_cargo || '',
      modelo_trabalho: 'presencial',
      regime_contrato: 'CLT',
      salario: c.vaga_salario ? String(c.vaga_salario) : '',
      criar_conta: true,
      email_conta: c.email || '',
      senha_conta: '',
    })
    setIsApprovalModalOpen(true)
  }

  const handleApproveCandidate = async () => {
    if (!candidaturaForApproval) return

    setApprovingId(candidaturaForApproval.id)
    try {
      const res = await fetch('/api/candidatos/aprovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatura_id: candidaturaForApproval.id,
          candidato_id: candidaturaForApproval.candidato_id,
          nome: candidaturaForApproval.nome,
          email: candidaturaForApproval.email,
          ...formData,
        }),
      })

      if (res.ok) {
        await res.json()
        setCandidaturas(prev =>
          prev.map(c =>
            c.id === candidaturaForApproval.id ? { ...c, status: 'contratado' } : c
          )
        )
        setIsApprovalModalOpen(false)
        toast.success('Candidato aprovado e cadastrado como colaborador!')
      } else {
        const error = await res.json()
        toast.error(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      toast.error('Erro ao aprovar candidato')
    } finally {
      setApprovingId(null)
    }
  }

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    lido: 'Lido',
    rejeito: 'Rejeitado',
    contratado: 'Contratado',
    banco_talentos: 'Banco de Talentos',
  }

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-500/20 text-yellow-400',
    lido: 'bg-blue-500/20 text-blue-400',
    rejeito: 'bg-red-500/20 text-red-400',
    contratado: 'bg-green-500/20 text-green-400',
    banco_talentos: 'bg-purple-500/20 text-purple-400',
  }

  const tabLabels: Record<TabType, string> = {
    pendente: 'Pendentes',
    contratado: 'Aprovados',
    rejeito: 'Rejeitados',
    banco_talentos: 'Banco de Talentos',
  }

  return (
    <>
    <Toaster richColors position="top-right" />
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidatos</h1>
          <p className="text-sm text-muted-foreground">{candidaturas.length} candidaturas recebidas</p>
        </div>

        <div className="flex gap-3 items-end">
          <div className="w-64">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-card border-border h-10"
              />
            </div>
          </div>

          <div className="w-64">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Filtrar por Vaga</Label>
            <Select value={filterVaga} onValueChange={(val) => setFilterVaga(val || "")}>
              <SelectTrigger className="bg-card border-border h-10 w-full">
                <SelectValue placeholder="Todas as Vagas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Vagas</SelectItem>
                {vagas.map(vaga => (
                  <SelectItem key={vaga} value={vaga}>{vaga}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#00D4FF] text-[#00D4FF]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a5e]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[35%]">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[30%]">Vaga</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Match</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Classificação</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 text-gray-300">Carregando...</td>
                </tr>
              ) : (
                <>
                  {/* Candidatos Avaliados (tabela candidatos com DISC/match) */}
                  {filteredAvaliados.map(c => (
                    <tr key={`avaliado-${c.id}`}
                      className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => { setSelectedCandidatoAvaliado(c); setIsCandidatoOpen(true) }}
                    >
                      <td className="px-4 py-3.5 text-gray-300">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-white text-sm">{c.nome_completo}</p>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">DISC</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{(c.vaga as Vaga)?.titulo || c.cargo_pretendido || '-'}</td>
                      <td className="px-4 py-3.5"><MatchScoreBadge score={c.match_score} /></td>
                      <td className="px-4 py-3.5"><ClassificacaoBadge classificacao={c.classificacao} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                          onClick={e => { e.stopPropagation(); setCandidatoAvaliadoForAction(c); setIsAvaliadoActionsOpen(true) }}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Candidaturas brutas (formulário público) */}
                  {paginated.map(c => (
                    <tr key={c.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => { setSelectedCandidatura(c); setIsOpen(true) }}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-white text-sm">{c.nome}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{c.vaga_titulo}</td>
                      <td className="px-4 py-3.5"><span className="text-xs text-gray-600">—</span></td>
                      <td className="px-4 py-3.5"><span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span></td>
                      <td className="px-4 py-3.5 text-right">
                        {(c.status === 'pendente' || c.status === 'rejeito' || c.status === 'banco_talentos') && (
                          <button className="p-1.5 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                            onClick={e => { e.stopPropagation(); setCandidaturaForAction(c); setIsActionsModalOpen(true) }}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredAvaliados.length === 0 && paginated.length === 0 && (
                    <tr className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 text-gray-300">
                        Nenhum candidato encontrado
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCandidatura && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCandidatura.nome}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status e Vaga */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Vaga</p>
                    <p className="text-foreground font-medium">{selectedCandidatura.vaga_titulo}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold border border-[#1e2a5e] text-gray-300">
                    {statusLabels[selectedCandidatura.status]}
                  </span>
                </div>

                {/* Informações de Contato */}
                <div className="bg-secondary/30 rounded-lg p-4 border border-border space-y-3">
                  <h3 className="font-semibold text-sm">Informações de Contato</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Email</p>
                      <a href={`mailto:${selectedCandidatura.email}`} className="text-[#00D4FF] hover:underline break-all">
                        {selectedCandidatura.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Telefone</p>
                      <a href={`tel:${selectedCandidatura.telefone}`} className="text-[#00D4FF] hover:underline">
                        {selectedCandidatura.telefone}
                      </a>
                    </div>
                    {selectedCandidatura.linkedin && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">LinkedIn</p>
                        <a
                          href={`https://${selectedCandidatura.linkedin.replace(/^https?:\/\//, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00D4FF] hover:underline break-all"
                        >
                          {selectedCandidatura.linkedin}
                        </a>
                      </div>
                    )}
                    {selectedCandidatura.pretensao_salarial && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Pretensão Salarial</p>
                        <p className="text-foreground font-medium">{selectedCandidatura.pretensao_salarial}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensagem */}
                {selectedCandidatura.mensagem && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold mb-2">Mensagem</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {selectedCandidatura.mensagem}
                    </p>
                  </div>
                )}

                {/* Currículo */}
                <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-3">Currículo</p>
                  {selectedCandidatura.curriculo_nome ? (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleDownload(selectedCandidatura.id, selectedCandidatura.curriculo_nome || '')}
                    >
                      <Download className="w-4 h-4" />
                      Baixar {selectedCandidatura.curriculo_nome}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nenhum currículo enviado</p>
                  )}
                </div>

                {/* Datas */}
                <div className="text-xs text-muted-foreground">
                  <p>Candidatou-se em: {new Date(selectedCandidatura.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Candidato Avaliado (perfil DISC) */}
      <Dialog open={isCandidatoOpen} onOpenChange={setIsCandidatoOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCandidatoAvaliado && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCandidatoAvaliado.nome_completo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={selectedCandidatoAvaliado.match_score} />
                  <ClassificacaoBadge classificacao={selectedCandidatoAvaliado.classificacao} />
                </div>
                <div className="bg-secondary/30 rounded-lg p-4 border border-border space-y-3">
                  <h3 className="font-semibold text-sm">Informações de Contato</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Email</p>
                      <a href={`mailto:${selectedCandidatoAvaliado.email}`} className="text-[#00D4FF] hover:underline break-all">
                        {selectedCandidatoAvaliado.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">WhatsApp</p>
                      <p className="text-foreground">{selectedCandidatoAvaliado.whatsapp || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Cargo Pretendido</p>
                      <p className="text-foreground">{selectedCandidatoAvaliado.cargo_pretendido || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Vaga</p>
                      <p className="text-foreground">{(selectedCandidatoAvaliado.vaga as Vaga)?.titulo || '—'}</p>
                    </div>
                  </div>
                </div>
                {selectedCandidatoAvaliado.perfil_disc && (
                  <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-sm mb-3">Perfil DISC</h3>
                    <DISCBars perfil={selectedCandidatoAvaliado.perfil_disc} />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Teste DISC */}
      <Dialog
        open={isTestModalOpen}
        onOpenChange={open => {
          if (!open) {
            setIsTestModalOpen(false)
            setSelectedTemplate('')
            setCandidaturaForTest(null)
            setTestLink('')
            setShowTestLink(false)
            setTesteLinksExistentes([])
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {showTestLink ? '✅ Link Gerado' : 'Enviar Teste DISC'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Candidato */}
            <div className="bg-secondary/40 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Candidato</p>
              <p className="text-sm font-semibold text-foreground">{candidaturaForTest?.nome}</p>
              <p className="text-xs text-muted-foreground">{candidaturaForTest?.email}</p>
            </div>

            {showTestLink ? (
              /* Exibe link recém-gerado */
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Link para compartilhar:</p>
                  <div className="bg-secondary/50 border border-border rounded-lg p-3.5 flex items-center gap-2">
                    <code className="text-xs break-all text-foreground flex-1 font-mono">{testLink}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                      onClick={() => { navigator.clipboard.writeText(testLink); toast.success('Link copiado!') }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Válido por 30 dias</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowTestLink(false); setTestLink(''); setSelectedTemplate('') }}
                  >
                    Gerar Outro
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90"
                    onClick={() => {
                      setIsTestModalOpen(false)
                      setSelectedTemplate('')
                      setCandidaturaForTest(null)
                      setTestLink('')
                      setShowTestLink(false)
                      setTesteLinksExistentes([])
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              </>
            ) : (
              /* Seleção de template */
              <>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Selecione o Teste</Label>
                  <Select value={selectedTemplate} onValueChange={(val) => setSelectedTemplate(val || "")}>
                    <SelectTrigger className="bg-card border-border h-10">
                      <span className={selectedTemplate ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedTemplate
                          ? templates.find(t => t.id === selectedTemplate)?.nome
                          : 'Escolha um template...'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length === 0
                        ? <div className="p-2 text-xs text-muted-foreground">Nenhum template disponível</div>
                        : templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end border-t border-border pt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsTestModalOpen(false)}>Cancelar</Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90"
                    disabled={!selectedTemplate}
                    onClick={async () => {
                      if (!candidaturaForTest || !selectedTemplate) return
                      const res = await fetch('/api/testes/gerar-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ candidatura_id: candidaturaForTest.id, template_id: selectedTemplate }),
                      })
                      if (res.ok) {
                        const data = await res.json()
                        setTestLink(data.link)
                        setShowTestLink(true)
                        // Refresh list
                        fetch(`/api/testes/links?candidatura_id=${candidaturaForTest.id}`)
                          .then(r => r.json()).then(setTesteLinksExistentes).catch(() => {})
                      }
                    }}
                  >
                    Gerar Link
                  </Button>
                </div>
              </>
            )}

            {/* Links já gerados */}
            {testeLinksExistentes.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Links gerados anteriormente</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {testeLinksExistentes.map(link => {
                    const url = `${window.location.origin}/testes/responder/${link.token}`
                    return (
                      <div key={link.id} className="bg-secondary/30 rounded-lg p-3 border border-border flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-medium text-foreground truncate">{link.template_nome}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${link.respondido ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {link.respondido ? 'Respondido' : 'Pendente'}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{new Date(link.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-[#00D4FF] hover:bg-[#00D4FF]/10 shrink-0"
                          onClick={() => { navigator.clipboard.writeText(url); toast.success('Link copiado!') }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aprovação e Cadastro como Colaborador */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              Aprovar e Cadastrar Colaborador
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* SEÇÃO 1: Informações do Candidato */}
            <div>
              <h3 className="text-sm font-bold text-[#00D4FF] mb-4 uppercase tracking-wide">
                Informações do Candidato
              </h3>
              <div className="grid grid-cols-3 gap-4 bg-card border border-border rounded-xl p-5">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Nome Completo</p>
                  <p className="text-sm font-semibold text-foreground">
                    {candidaturaForApproval?.nome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Email</p>
                  <p className="text-sm font-semibold text-foreground break-all">
                    {candidaturaForApproval?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Data da Candidatura</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(candidaturaForApproval?.created_at || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: Vaga e Posição */}
            <div>
              <h3 className="text-sm font-bold text-[#00D4FF] mb-4 uppercase tracking-wide">
                Vaga Referente
              </h3>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Posição</p>
                <p className="text-sm font-semibold text-foreground">
                  {candidaturaForApproval?.vaga_titulo}
                </p>
              </div>
            </div>

            {/* SEÇÃO 3: Dados de Contratação */}
            <div>
              <h3 className="text-sm font-bold text-[#00D4FF] mb-4 uppercase tracking-wide">
                Dados de Contratação
              </h3>
              <div className="space-y-4">
                {/* Data de Contratação */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="data_contratacao" className="text-xs font-semibold mb-2 block">
                      Data de Contratação
                    </Label>
                    <Input
                      id="data_contratacao"
                      type="date"
                      value={formData.data_contratacao}
                      onChange={(e) => setFormData({ ...formData, data_contratacao: e.target.value })}
                      className="bg-card border-border"
                    />
                  </div>
                </div>

                {/* Cargo e Departamento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cargo" className="text-xs font-semibold mb-2 block">
                      Cargo
                      {!cargosDeptLoading && cargos.length === 0 && (
                        <span className="text-orange-400 text-xs ml-1">(nenhum cadastrado)</span>
                      )}
                    </Label>
                    {cargosDeptLoading ? (
                      <div className="h-10 bg-card rounded border border-border animate-pulse" />
                    ) : cargos.length > 0 ? (
                      <Select
                        value={formData.cargo}
                        onValueChange={(val) => val !== null && setFormData({ ...formData, cargo: val })}
                      >
                        <SelectTrigger className="bg-card border-border h-10">
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {cargos.map(cargo => (
                            <SelectItem key={cargo.id} value={cargo.nome}>{cargo.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="cargo"
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        className="bg-card border-border"
                        placeholder="Digite o cargo (ex: Engenheiro de Software)"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="departamento" className="text-xs font-semibold mb-2 block">
                      Departamento
                      {!cargosDeptLoading && departamentos.length === 0 && (
                        <span className="text-orange-400 text-xs ml-1">(nenhum cadastrado)</span>
                      )}
                    </Label>
                    {cargosDeptLoading ? (
                      <div className="h-10 bg-card rounded border border-border animate-pulse" />
                    ) : departamentos.length > 0 ? (
                      <Select
                        value={formData.departamento}
                        onValueChange={(val) => val !== null && setFormData({ ...formData, departamento: val })}
                      >
                        <SelectTrigger className="bg-card border-border h-10">
                          <SelectValue placeholder="Selecione um departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departamentos.map(dept => (
                            <SelectItem key={dept.id} value={dept.nome}>{dept.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="departamento"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        className="bg-card border-border"
                        placeholder="Digite o departamento (ex: Tecnologia)"
                      />
                    )}
                  </div>
                </div>

                {/* Modelo de Trabalho e Regime de Contrato */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modelo_trabalho" className="text-xs font-semibold mb-2 block">
                      Modelo de Trabalho
                    </Label>
                    <select
                      id="modelo_trabalho"
                      value={formData.modelo_trabalho}
                      onChange={(e) => setFormData({ ...formData, modelo_trabalho: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm"
                    >
                      <option value="presencial">🏢 Presencial</option>
                      <option value="remoto">🏠 Remoto</option>
                      <option value="hibrido">🔄 Híbrido</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="regime_contrato" className="text-xs font-semibold mb-2 block">
                      Regime de Contrato
                    </Label>
                    <select
                      id="regime_contrato"
                      value={formData.regime_contrato}
                      onChange={(e) => setFormData({ ...formData, regime_contrato: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm"
                    >
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Estagio">Estágio</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                {/* Salário */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="salario" className="text-xs font-semibold mb-2 block">
                      Salário (opcional)
                    </Label>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">R$</span>
                      <Input
                        id="salario"
                        type="number"
                        step="0.01"
                        value={formData.salario}
                        onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                        className="bg-card border-border"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: Conta de Colaborador */}
            <div>
              <h3 className="text-sm font-bold text-[#00D4FF] mb-4 uppercase tracking-wide flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Conta de Colaborador
              </h3>
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Criar conta de acesso</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Separada da conta de candidato — o colaborador poderá acessar o painel como funcionário
                    </p>
                  </div>
                  <Switch
                    checked={formData.criar_conta}
                    onCheckedChange={(v) => setFormData({ ...formData, criar_conta: v })}
                  />
                </div>

                {formData.criar_conta && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Email da conta</Label>
                      <Input
                        type="email"
                        value={formData.email_conta}
                        onChange={(e) => setFormData({ ...formData, email_conta: e.target.value })}
                        className="bg-background border-border"
                        placeholder="email@empresa.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pode ser diferente do email da candidatura (ex: email corporativo)
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Senha temporária</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showSenhaConta ? 'text' : 'password'}
                            value={formData.senha_conta}
                            onChange={(e) => setFormData({ ...formData, senha_conta: e.target.value })}
                            className="bg-background border-border pr-10"
                            placeholder="Mín. 8 chars, maiúscula, número"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSenhaConta(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showSenhaConta ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Gerar senha"
                          onClick={() => {
                            const nome = candidaturaForApproval?.nome || 'Colaborador'
                            const prefixo = nome.trim().split(' ')[0]
                            const cap = prefixo.charAt(0).toUpperCase() + prefixo.slice(1, 4).toLowerCase()
                            const num = Math.floor(1000 + Math.random() * 9000)
                            setFormData({ ...formData, senha_conta: `${cap}@${num}` })
                            setShowSenhaConta(true)
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Compartilhe esta senha com o colaborador após a aprovação
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO 5: Botões de Ação */}
            <div className="flex gap-3 justify-end pt-6 border-t border-border">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsApprovalModalOpen(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 px-8"
                disabled={approvingId !== null}
                onClick={handleApproveCandidate}
              >
                {approvingId === candidaturaForApproval?.id ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin">⏳</div>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Aprovar e Cadastrar
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Ações */}
      <Dialog open={isActionsModalOpen} onOpenChange={setIsActionsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ações para {candidaturaForAction?.nome}</DialogTitle>
            <DialogDescription>
              {candidaturaForAction?.status === 'pendente'
                ? 'Escolha uma ação para este candidato'
                : 'Opções disponíveis'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-6">
            {candidaturaForAction?.status === 'pendente' && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left"
                  onClick={() => {
                    setCandidaturaForAction(null)
                    setIsActionsModalOpen(false)
                    setTimeout(() => handleOpenApprovalModal(candidaturaForAction!), 100)
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Aprovar</p>
                    <p className="text-xs text-muted-foreground">Cadastrar como colaborador</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-[#00D4FF]/10"
                  onClick={() => {
                    setCandidaturaForTest(candidaturaForAction)
                    setIsActionsModalOpen(false)
                    setIsTestModalOpen(true)
                  }}
                >
                  <Link2 className="w-5 h-5 text-[#00D4FF] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Enviar Teste DISC</p>
                    <p className="text-xs text-muted-foreground">Gerar link para o candidato responder</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-purple-500/10"
                  onClick={handleTalentBank}
                  disabled={actionLoading}
                >
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Banco de Talentos</p>
                    <p className="text-xs text-muted-foreground">Guardar para futuras oportunidades</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-red-500/10"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  <ThumbsDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Rejeitar</p>
                    <p className="text-xs text-muted-foreground">Não prosseguir com a candidatura</p>
                  </div>
                </Button>
              </>
            )}

            {candidaturaForAction?.status === 'banco_talentos' && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left"
                  onClick={() => {
                    setCandidaturaForAction(null)
                    setIsActionsModalOpen(false)
                    setTimeout(() => handleOpenApprovalModal(candidaturaForAction!), 100)
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Aprovar</p>
                    <p className="text-xs text-muted-foreground">Cadastrar como colaborador</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-blue-500/10"
                  onClick={handleBackToPending}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Voltar para Pendentes</p>
                    <p className="text-xs text-muted-foreground">Recolocar na fila de avaliação</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-red-500/10"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  <ThumbsDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Rejeitar</p>
                    <p className="text-xs text-muted-foreground">Não prosseguir com a candidatura</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-red-500/10"
                  onClick={handleDeleteCandidatura}
                  disabled={actionLoading}
                >
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Excluir</p>
                    <p className="text-xs text-muted-foreground">Remover permanentemente</p>
                  </div>
                </Button>
              </>
            )}

            {candidaturaForAction?.status === 'rejeito' && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-blue-500/10"
                  onClick={handleBackToPending}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Voltar para Pendentes</p>
                    <p className="text-xs text-muted-foreground">Reconsiderar candidato</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-red-500/10"
                  onClick={handleDeleteCandidatura}
                  disabled={actionLoading}
                >
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Excluir</p>
                    <p className="text-xs text-muted-foreground">Remover permanentemente</p>
                  </div>
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setIsActionsModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de Ações — Candidato Avaliado (DISC) */}
      <Dialog open={isAvaliadoActionsOpen} onOpenChange={setIsAvaliadoActionsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ações para {candidatoAvaliadoForAction?.nome_completo}</DialogTitle>
            <DialogDescription>
              {candidatoAvaliadoForAction?.classificacao
                ? `Classificação: ${candidatoAvaliadoForAction.classificacao} · Match: ${candidatoAvaliadoForAction.match_score ?? '—'}%`
                : 'Escolha uma ação'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {!candidatoAvaliadoForAction?.perfil_disc && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-[#00D4FF]/10"
                onClick={() => {
                  if (!candidatoAvaliadoForAction) return
                  setCandidaturaForTest({
                    id: candidatoAvaliadoForAction.id,
                    nome: candidatoAvaliadoForAction.nome_completo,
                    email: candidatoAvaliadoForAction.email,
                  } as any)
                  setIsAvaliadoActionsOpen(false)
                  setIsTestModalOpen(true)
                }}
              >
                <Link2 className="w-5 h-5 text-[#00D4FF] flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Enviar Teste DISC</p>
                  <p className="text-xs text-muted-foreground">Candidato ainda não respondeu o teste</p>
                </div>
              </Button>
            )}

            {(candidatoAvaliadoForAction?.status_candidatura === 'inscrito' || candidatoAvaliadoForAction?.status_candidatura === 'em_avaliacao') && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-green-500/10"
                  onClick={() => handleAvaliadoStatusChange('aprovado')}
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Aprovar</p>
                    <p className="text-xs text-muted-foreground">Avançar para etapa de contratação</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-purple-500/10"
                  onClick={() => handleAvaliadoStatusChange('em_avaliacao')}
                >
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Em Avaliação</p>
                    <p className="text-xs text-muted-foreground">Marcar para avaliação aprofundada</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-red-500/10"
                  onClick={() => handleAvaliadoStatusChange('reprovado')}
                >
                  <ThumbsDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Reprovar</p>
                    <p className="text-xs text-muted-foreground">Não prosseguir com este candidato</p>
                  </div>
                </Button>
              </>
            )}

            {candidatoAvaliadoForAction?.status_candidatura === 'aprovado' && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-green-500/10"
                  onClick={() => handleAvaliadoStatusChange('contratado')}
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Confirmar Contratação</p>
                    <p className="text-xs text-muted-foreground">Marcar como contratado</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 text-left hover:bg-red-500/10"
                  onClick={() => handleAvaliadoStatusChange('reprovado')}
                >
                  <ThumbsDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Reprovar</p>
                    <p className="text-xs text-muted-foreground">Reverter aprovação</p>
                  </div>
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsAvaliadoActionsOpen(false)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
