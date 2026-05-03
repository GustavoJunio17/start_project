'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ClassificacaoBadge, MatchScoreBadge } from '@/components/ranking/ClassificacaoBadge'
import { DISCChart, DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import type { Candidato, StatusCandidatura, TipoAgendamento, Vaga } from '@/types/database'
import { Search, Calendar, Eye } from 'lucide-react'

const supabase = createClient()
const ITEMS_PER_PAGE = 20

const STATUS_LABELS: Record<StatusCandidatura, string> = {
  inscrito: 'Inscrito', em_avaliacao: 'Em Avaliação', entrevista_agendada: 'Entrevista',
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
      candidato_id: agendCandId, empresa_id: user.empresa_id,
      gestor_responsavel_id: user.id, ...agendForm,
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

  useEffect(() => setPage(1), [search, filterStatus])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Candidatos</h1>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF]/50 transition-colors" />
        </div>
        <Select value={filterStatus} onValueChange={v => v && setFilterStatus(v)}>
          <SelectTrigger className="w-40 bg-[#111633] border-[#1e2a5e]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedCandidato} onOpenChange={open => !open && setSelectedCandidato(null)}>
        <DialogContent className="bg-[#0A0E27] border-[#1e2a5e] max-w-2xl">
          {selectedCandidato && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{selectedCandidato.nome_completo}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">E-mail: {selectedCandidato.email}</p>
                  <p className="text-sm text-gray-400">WhatsApp: {selectedCandidato.whatsapp || '-'}</p>
                  <p className="text-sm text-gray-400">Cargo: {selectedCandidato.cargo_pretendido || '-'}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <MatchScoreBadge score={selectedCandidato.match_score} />
                    <ClassificacaoBadge classificacao={selectedCandidato.classificacao} />
                  </div>
                  {selectedCandidato.perfil_disc && (
                    <div className="mt-4"><DISCBars perfil={selectedCandidato.perfil_disc} /></div>
                  )}
                </div>
                <div>
                  {selectedCandidato.perfil_disc && (
                    <DISCChart perfil={selectedCandidato.perfil_disc} perfilIdeal={(selectedCandidato.vaga as any)?.perfil_disc_ideal} size={200} />
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Agendar dialog */}
      <Dialog open={agendDialogOpen} onOpenChange={setAgendDialogOpen}>
        <DialogContent className="bg-[#0A0E27] border-[#1e2a5e]">
          <DialogHeader><DialogTitle className="text-white">Agendar Entrevista</DialogTitle></DialogHeader>
          <form onSubmit={handleAgendar} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Data e Hora</label>
              <input type="datetime-local" value={agendForm.data_hora} onChange={e => setAgendForm({ ...agendForm, data_hora: e.target.value })} required
                className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Tipo</label>
              <Select value={agendForm.tipo} onValueChange={v => setAgendForm({ ...agendForm, tipo: v as TipoAgendamento })}>
                <SelectTrigger className="bg-[#111633] border-[#1e2a5e]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {agendForm.tipo === 'online' ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Link da Reunião</label>
                <input value={agendForm.link_reuniao} onChange={e => setAgendForm({ ...agendForm, link_reuniao: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Endereço</label>
                <input value={agendForm.endereco} onChange={e => setAgendForm({ ...agendForm, endereco: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Observações</label>
              <textarea value={agendForm.observacoes} onChange={e => setAgendForm({ ...agendForm, observacoes: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" rows={3} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all">Agendar</button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden" id="candidatos-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Candidato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Vaga</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Match</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Class.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Carregando...</td></tr>
            ) : paginated.map(c => (
              <tr key={c.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5">
                  <button onClick={() => setSelectedCandidato(c)} className="text-left">
                    <p className="font-medium text-white hover:text-[#00D4FF] transition-colors">{c.nome_completo}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </button>
                </td>
                <td className="px-4 py-3.5 text-gray-400">{(c.vaga as any)?.titulo || '-'}</td>
                <td className="px-4 py-3.5"><MatchScoreBadge score={c.match_score} /></td>
                <td className="px-4 py-3.5"><ClassificacaoBadge classificacao={c.classificacao} /></td>
                <td className="px-4 py-3.5">
                  <Select value={c.status_candidatura} onValueChange={v => handleStatusChange(c.id, v as StatusCandidatura)}>
                    <SelectTrigger className="w-32 h-8 text-xs bg-[#0A0E27] border-[#1e2a5e]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedCandidato(c)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setAgendCandId(c.id); setAgendDialogOpen(true) }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
      </div>
    </div>
  )
}
