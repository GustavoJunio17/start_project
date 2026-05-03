'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DISCChart, DISCBars } from '@/components/disc/DISCChart'
import { Pagination } from '@/components/ui/pagination'
import type { Colaborador, StatusColaborador } from '@/types/database'
import { Search, Eye, AlertTriangle } from 'lucide-react'

const ITEMS_PER_PAGE = 20

const STATUS_COLORS: Record<StatusColaborador, string> = {
  em_treinamento: 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20',
  ativo: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  desligado: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
}

export default function GestorColaboradoresPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Colaborador | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const res = await fetch('/api/empresa/colaboradores')
      const data = res.ok ? await res.json() : []
      setColaboradores(data)
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = colaboradores.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => setPage(1), [search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const needsReavaliacao = (c: Colaborador) => {
    if (!c.proxima_reavaliacao) return false
    return new Date(c.proxima_reavaliacao) <= new Date()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Colaboradores</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF]/50 transition-colors" />
      </div>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="bg-[#0A0E27] border-[#1e2a5e] max-w-lg">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="text-white">{selected.nome}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-400">Cargo: <span className="text-white">{selected.cargo || '-'}</span></p>
                  <p className="text-gray-400">E-mail: <span className="text-white">{selected.email || '-'}</span></p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                  </div>
                  <p className="text-gray-400">Origem: <span className="text-white">{selected.origem.replace(/_/g, ' ')}</span></p>
                </div>
                {selected.perfil_disc && (
                  <>
                    <DISCChart perfil={selected.perfil_disc} size={250} />
                    <DISCBars perfil={selected.perfil_disc} />
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              {['Nome', 'Cargo', 'Status', 'Reavaliação', 'DISC', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Carregando...</td></tr>
            ) : paginated.map(c => (
              <tr key={c.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-white">{c.nome}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </td>
                <td className="px-4 py-3.5 text-gray-400">{c.cargo || '-'}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    {needsReavaliacao(c) && <AlertTriangle className="w-3 h-3 text-[#EF4444]" />}
                    <span className={`text-xs ${needsReavaliacao(c) ? 'text-[#EF4444]' : 'text-gray-400'}`}>
                      {c.proxima_reavaliacao ? new Date(c.proxima_reavaliacao).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 w-40">
                  {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-xs text-gray-600">Pendente</span>}
                </td>
                <td className="px-4 py-3.5">
                  <button onClick={() => setSelected(c)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
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
