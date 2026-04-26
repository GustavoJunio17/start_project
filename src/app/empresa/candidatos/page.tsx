'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, X, Plus, CheckCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const ITEMS_PER_PAGE = 20

export default function CandidatosPage() {
  const [candidaturas, setCandidaturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVaga, setFilterVaga] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedCandidatura, setSelectedCandidatura] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [candidaturaForTest, setCandidaturaForTest] = useState<any>(null)
  const [testLink, setTestLink] = useState('')
  const [showTestLink, setShowTestLink] = useState(false)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [candidaturaForApproval, setCandidaturaForApproval] = useState<any>(null)
  const [formData, setFormData] = useState({
    data_contratacao: new Date().toISOString().split('T')[0],
    departamento: '',
    cargo: '',
    modelo_trabalho: 'presencial',
    regime_contrato: 'CLT',
    salario: '',
  })
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/candidaturas/empresa').then(r => r.json()),
      fetch('/api/empresa/templates').then(r => r.json()),
    ]).then(([candidaturas, templates]) => {
      setCandidaturas(Array.isArray(candidaturas) ? candidaturas : [])
      setTemplates(Array.isArray(templates) ? templates : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const vagas = [...new Set(candidaturas.map(c => c.vaga_titulo))].filter(Boolean)
  const statuses = ['pendente', 'rejeito', 'contratado']

  const filtered = candidaturas.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase())
    const matchVaga = filterVaga === 'all' || c.vaga_titulo === filterVaga
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchVaga && matchStatus
  })

  useEffect(() => setPage(1), [search, filterVaga, filterStatus])

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

  const handleOpenApprovalModal = (c: any) => {
    setCandidaturaForApproval(c)
    setFormData({
      data_contratacao: new Date().toISOString().split('T')[0],
      departamento: c.vaga_departamento || '',
      cargo: c.vaga_titulo || '',
      modelo_trabalho: 'presencial',
      regime_contrato: 'CLT',
      salario: c.vaga_salario ? String(c.vaga_salario) : '',
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
        const data = await res.json()
        setCandidaturas(prev =>
          prev.map(c =>
            c.id === candidaturaForApproval.id ? { ...c, status: 'contratado' } : c
          )
        )
        setIsApprovalModalOpen(false)
        alert('✅ Candidato aprovado e cadastrado como colaborador!')
      } else {
        const error = await res.json()
        alert(`❌ Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      alert('Erro ao aprovar candidato')
    } finally {
      setApprovingId(null)
    }
  }

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    lido: 'Lido',
    rejeito: 'Rejeitado',
    contratado: 'Contratado',
  }

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-500/20 text-yellow-400',
    lido: 'bg-blue-500/20 text-blue-400',
    rejeito: 'bg-red-500/20 text-red-400',
    contratado: 'bg-green-500/20 text-green-400',
  }

  return (
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
            <Select value={filterVaga} onValueChange={setFilterVaga}>
              <SelectTrigger className="bg-card border-border h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Vagas</SelectItem>
                {vagas.map(vaga => (
                  <SelectItem key={vaga} value={vaga}>{vaga}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-64">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Filtrar por Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-card border-border h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-2/5">Nome</TableHead>
                <TableHead className="w-2/5">Vaga</TableHead>
                <TableHead className="w-1/5">Data</TableHead>
                <TableHead className="text-right w-20">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma candidatura encontrada
                  </TableCell>
                </TableRow>
              ) : paginated.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell
                    className="font-medium text-foreground cursor-pointer hover:text-[#00D4FF] transition-colors"
                    onClick={() => {
                      setSelectedCandidatura(c)
                      setIsOpen(true)
                    }}
                  >
                    {c.nome}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground cursor-pointer hover:text-[#00D4FF] transition-colors"
                    onClick={() => {
                      setSelectedCandidatura(c)
                      setIsOpen(true)
                    }}
                  >
                    {c.vaga_titulo}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground text-sm cursor-pointer hover:text-[#00D4FF] transition-colors"
                    onClick={() => {
                      setSelectedCandidatura(c)
                      setIsOpen(true)
                    }}
                  >
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    {c.status === 'contratado' ? (
                      <span className="text-xs text-green-400 font-semibold">Contratado</span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-green-400 hover:text-green-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenApprovalModal(c)
                          }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aprovar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-[#00D4FF] hover:text-[#00D4FF]"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCandidaturaForTest(c)
                            setIsTestModalOpen(true)
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Teste
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>

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
                  <Badge className={statusColors[selectedCandidatura.status]}>
                    {statusLabels[selectedCandidatura.status]}
                  </Badge>
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
                      onClick={() => handleDownload(selectedCandidatura.id, selectedCandidatura.curriculo_nome)}
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

      {/* Modal de Seleção de Teste */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Enviar Teste</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-6">
            {/* Candidato */}
            <div className="bg-secondary/40 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground font-semibold mb-1.5">Candidato</p>
              <p className="text-sm font-semibold text-foreground">{candidaturaForTest?.nome}</p>
              <p className="text-xs text-muted-foreground mt-1">{candidaturaForTest?.email}</p>
            </div>

            {/* Seleção de Teste */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block">Selecione o Teste</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="bg-card border-border h-10">
                  <SelectValue placeholder="Escolha um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">Nenhum template disponível</div>
                  ) : (
                    templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Template selecionado: <span className="text-[#00D4FF]">{templates.find(t => t.id === selectedTemplate)?.nome}</span>
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsTestModalOpen(false)
                  setSelectedTemplate('')
                  setCandidaturaForTest(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90"
                disabled={!selectedTemplate || templates.length === 0}
                onClick={async () => {
                  if (!candidaturaForTest || !selectedTemplate) return

                  const res = await fetch('/api/testes/gerar-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      candidatura_id: candidaturaForTest.id,
                      template_id: selectedTemplate,
                    }),
                  })

                  if (res.ok) {
                    const data = await res.json()
                    setTestLink(data.link)
                    setShowTestLink(true)
                  }
                }}
              >
                Gerar Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal com Link Gerado */}
      <Dialog open={showTestLink} onOpenChange={setShowTestLink}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              ✅ Link Gerado com Sucesso
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {/* Informação */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-xs text-green-400 font-semibold mb-1">Candidato</p>
              <p className="text-sm text-foreground font-medium">{candidaturaForTest?.nome}</p>
            </div>

            {/* Link */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2.5">Compartilhe este link:</p>
              <div className="bg-secondary/50 border border-border rounded-lg p-3.5 flex items-center gap-2">
                <code className="text-xs break-all text-foreground flex-1 font-mono">{testLink}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0 text-[#00D4FF] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
                  onClick={() => {
                    navigator.clipboard.writeText(testLink)
                    alert('Link copiado para a área de transferência!')
                  }}
                  title="Copiar link"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O candidato pode responder o teste por 30 dias
              </p>
            </div>

            {/* Botão */}
            <Button
              className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90"
              onClick={() => {
                setShowTestLink(false)
                setIsTestModalOpen(false)
                setSelectedTemplate('')
                setCandidaturaForTest(null)
                setTestLink('')
              }}
            >
              Fechar
            </Button>
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
                    {new Date(candidaturaForApproval?.created_at).toLocaleDateString('pt-BR')}
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
                    </Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="bg-card border-border"
                      placeholder="ex: Engenheiro de Software"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departamento" className="text-xs font-semibold mb-2 block">
                      Departamento
                    </Label>
                    <Input
                      id="departamento"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="bg-card border-border"
                      placeholder="ex: Tecnologia"
                    />
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

            {/* SEÇÃO 4: Botões de Ação */}
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
    </div>
  )
}
