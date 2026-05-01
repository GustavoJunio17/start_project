'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCChart, DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import type { Candidato, StatusCandidatura, Agendamento, TipoAgendamento, Vaga } from '@/types/database'
import { Search, Calendar, Eye } from 'lucide-react'

const supabase = createClient()

const ITEMS_PER_PAGE = 20

const STATUS_LABELS: Record<StatusCandidatura, string> = {
  inscrito: 'Inscrito', em_avaliacao: 'Em Avaliacao', entrevista_agendada: 'Entrevista',
  aprovado: 'Aprovado', reprovado: 'Reprovado', contratado: 'Contratado',
}

export default function GestorCandidatosPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [vagas, setVagas] = useState<Pick<Vaga, 'id' | 'titulo'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null)
  const [agendDialogOpen, setAgendDialogOpen] = useState(false)
  const [agendForm, setAgendForm] = useState({ data_hora: '', tipo: 'online' as TipoAgendamento, link_reuniao: '', endereco: '', observacoes: '' })
  const [agendCandId, setAgendCandId] = useState('')
  const [page, setPage] = useState(1)

  const loadData = async () => {
    if (!user?.empresa_id) return
    const [candRes, vagasRes] = await Promise.all([
      supabase.from('candidatos').select('*, vaga:vagas(titulo, perfil_disc_ideal)').eq('empresa_id', user.empresa_id).order('match_score', { ascending: false, nullsFirst: false }),
      supabase.from('vagas').select('id, titulo').eq('empresa_id', user.empresa_id),
    ])
    const loaded = candRes.data || []
    setCandidatos(loaded)
    setVagas(vagasRes.data || [])
    setLoading(false)

    // Auto-abrir candidato via query param ?ver=ID
    const verId = searchParams.get('ver')
    if (verId) {
      const candidatoParaAbrir = loaded.find(c => c.id === verId)
      if (candidatoParaAbrir) setSelectedCandidato(candidatoParaAbrir)
    }
  }

  useEffect(() => { loadData() }, [user])

  const handleStatusChange = async (id: string, status: StatusCandidatura) => {
    await supabase.from('candidatos').update({ status_candidatura: status }).eq('id', id)
    if (status === 'contratado') {
      const c = candidatos.find(c => c.id === id)
      if (c) {
        await supabase.from('colaboradores').insert({
          user_id: c.user_id, empresa_id: c.empresa_id, nome: c.nome_completo,
          cargo: c.cargo_pretendido, email: c.email, data_contratacao: new Date().toISOString().split('T')[0],
          origem: 'conversao_candidato', perfil_disc: c.perfil_disc,
          proxima_reavaliacao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      }
    }
    loadData()
  }

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) return
    await supabase.from('agendamentos').insert({
      candidato_id: agendCandId,
      empresa_id: user.empresa_id,
      gestor_responsavel_id: user.id,
      ...agendForm,
    })
    await supabase.from('candidatos').update({ status_candidatura: 'entrevista_agendada' }).eq('id', agendCandId)
    setAgendDialogOpen(false)
    loadData()
  }

  const filtered = candidatos.filter(c => {
    const matchSearch = c.nome_completo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status_candidatura === filterStatus
    return matchSearch && matchStatus
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [search, filterStatus])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Candidatos</h1>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
        <Select value={filterStatus} onValueChange={v => v && setFilterStatus(v)}>
          <SelectTrigger className="w-40 bg-card border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedCandidato} onOpenChange={open => !open && setSelectedCandidato(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          {selectedCandidato && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCandidato.nome_completo}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">E-mail: {selectedCandidato.email}</p>
                  <p className="text-sm text-muted-foreground">WhatsApp: {selectedCandidato.whatsapp || '-'}</p>
                  <p className="text-sm text-muted-foreground">Cargo: {selectedCandidato.cargo_pretendido || '-'}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <MatchScoreBadge score={selectedCandidato.match_score} />
                    <ClassificacaoBadge classificacao={selectedCandidato.classificacao} />
                  </div>
                  {selectedCandidato.perfil_disc && (
                    <div className="mt-4">
                      <DISCBars perfil={selectedCandidato.perfil_disc} />
                    </div>
                  )}
                </div>
                <div>
                  {selectedCandidato.perfil_disc && (
                    <DISCChart
                      perfil={selectedCandidato.perfil_disc}
                      perfilIdeal={(selectedCandidato.vaga as any)?.perfil_disc_ideal}
                      size={200}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Agendar dialog */}
      <Dialog open={agendDialogOpen} onOpenChange={setAgendDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Agendar Entrevista</DialogTitle></DialogHeader>
          <form onSubmit={handleAgendar} className="space-y-4">
            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <Input type="datetime-local" value={agendForm.data_hora} onChange={e => setAgendForm({ ...agendForm, data_hora: e.target.value })} required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={agendForm.tipo} onValueChange={v => setAgendForm({ ...agendForm, tipo: v as TipoAgendamento })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {agendForm.tipo === 'online' ? (
              <div className="space-y-2">
                <Label>Link da Reuniao</Label>
                <Input value={agendForm.link_reuniao} onChange={e => setAgendForm({ ...agendForm, link_reuniao: e.target.value })} className="bg-background" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Endereco</Label>
                <Input value={agendForm.endereco} onChange={e => setAgendForm({ ...agendForm, endereco: e.target.value })} className="bg-background" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Textarea value={agendForm.observacoes} onChange={e => setAgendForm({ ...agendForm, observacoes: e.target.value })} className="bg-background" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">Agendar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="bg-card border-border" id="candidatos-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Candidato</TableHead>
                <TableHead>Vaga</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Class.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : paginated.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell>
                    <button onClick={() => setSelectedCandidato(c)} className="text-left">
                      <p className="font-medium text-foreground hover:text-[#00D4FF]">{c.nome_completo}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(c.vaga as any)?.titulo || '-'}</TableCell>
                  <TableCell><MatchScoreBadge score={c.match_score} /></TableCell>
                  <TableCell><ClassificacaoBadge classificacao={c.classificacao} /></TableCell>
                  <TableCell>
                    <Select value={c.status_candidatura} onValueChange={v => handleStatusChange(c.id, v as StatusCandidatura)}>
                      <SelectTrigger className="w-32 h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCandidato(c)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setAgendCandId(c.id); setAgendDialogOpen(true) }}><Calendar className="w-4 h-4" /></Button>
                    </div>
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
    </div>
  )
}
