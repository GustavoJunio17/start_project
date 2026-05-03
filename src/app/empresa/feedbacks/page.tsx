'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { QuadranteFeedback } from '@/components/feedback/QuadranteFeedback'
import { Pagination } from '@/components/ui/pagination'
import type { Feedback, Colaborador, TipoFeedback } from '@/types/database'
import { Plus, MessageSquare, StopCircle, Play, RefreshCw, Zap } from 'lucide-react'

const supabase = createClient()

const ITEMS_PER_PAGE = 15

export default function FeedbacksPage() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [colaboradores, setColaboradores] = useState<Pick<Colaborador, 'id' | 'nome'>[]>([])
  const [candidatos, setCandidatos] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [tipo, setTipo] = useState<TipoFeedback>('interno_colaborador')
  const [targetId, setTargetId] = useState('')
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const [fbRes, colRes, candRes] = await Promise.all([
        supabase.from('feedbacks').select('*').eq('empresa_id', user!.empresa_id!).order('created_at', { ascending: false }),
        supabase.from('colaboradores').select('id, nome').eq('empresa_id', user!.empresa_id!),
        fetch('/api/candidaturas/empresa').then(r => r.json()),
      ])
      setFeedbacks(fbRes.data || [])
      setColaboradores(colRes.data || [])
      // Deduplica por nome, preferindo entradas com candidato_id
      const seen = new Map<string, { id: string; nome: string }>()
      for (const c of (candRes as { id: string; nome: string; candidato_id?: string }[])) {
        const key = c.nome.toLowerCase().trim()
        if (!seen.has(key) || c.candidato_id) {
          seen.set(key, { id: c.candidato_id ?? c.id, nome: c.nome })
        }
      }
      setCandidatos(Array.from(seen.values()))
      setLoading(false)
    }
    load()
  }, [user])

  const handleSubmit = async (data: { parar: string; comecar: string; continuar: string; acao: string }) => {
    if (!user?.empresa_id || !targetId) return
    setSaving(true)
    await supabase.from('feedbacks').insert({
      empresa_id: user.empresa_id,
      autor_id: user.id,
      tipo,
      colaborador_id: tipo === 'interno_colaborador' ? targetId : null,
      candidato_id: tipo === 'externo_candidato' ? targetId : null,
      visivel_para_candidato: visivel,
      data_envio: new Date().toISOString(),
      ...data,
    })
    setSaving(false)
    setDialogOpen(false)
    setTargetId('')

    const { data: updatedFbs } = await supabase.from('feedbacks').select('*').eq('empresa_id', user.empresa_id).order('created_at', { ascending: false })
    setFeedbacks(updatedFbs || [])
  }

  const totalPages = Math.ceil(feedbacks.length / ITEMS_PER_PAGE)
  const paginated = feedbacks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Feedbacks</h1>
          <p className="text-gray-400 text-sm mt-1">{feedbacks.length} feedbacks enviados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
            <Plus className="w-4 h-4 mr-2" /> Novo Feedback
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-lg">Enviar Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Tipo</Label>
                  <Select value={tipo} onValueChange={v => { setTipo(v as TipoFeedback); setTargetId('') }}>
                    <SelectTrigger className="bg-background">
                      <span>{tipo === 'interno_colaborador' ? 'Colaborador' : 'Candidato'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interno_colaborador">Colaborador</SelectItem>
                      <SelectItem value="externo_candidato">Candidato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Destinatário</Label>
                  <Select value={targetId} onValueChange={(val) => setTargetId(val || "")}>
                    <SelectTrigger className="bg-background">
                      <span className={!targetId ? 'text-muted-foreground' : ''}>
                        {targetId
                          ? (tipo === 'interno_colaborador'
                              ? colaboradores.find(c => c.id === targetId)?.nome
                              : candidatos.find(c => c.id === targetId)?.nome) ?? 'Selecionar'
                          : 'Selecionar'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {tipo === 'interno_colaborador'
                        ? colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)
                        : candidatos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {tipo === 'externo_candidato' && (
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <Switch checked={visivel} onCheckedChange={setVisivel} />
                  <Label className="text-sm font-medium">Visível para o candidato</Label>
                </div>
              )}
              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-4">Feedback em Quadrantes</p>
                <QuadranteFeedback onSubmit={handleSubmit} loading={saving} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
          </div>
        ) : paginated.map(fb => (
          <div key={fb.id} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-xs text-gray-500">
                    {fb.tipo === 'interno_colaborador' ? 'Colaborador' : 'Candidato'} - {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Parar', value: fb.parar, icon: StopCircle, color: '#EF4444' },
                  { label: 'Comecar', value: fb.comecar, icon: Play, color: '#10B981' },
                  { label: 'Continuar', value: fb.continuar, icon: RefreshCw, color: '#0066FF' },
                  { label: 'Acao', value: fb.acao, icon: Zap, color: '#F59E0B' },
                ].map(q => (
                  <div key={q.label} className="p-2.5 rounded-lg bg-[#0A0E27] border border-[#1e2a5e]">
                    <div className="flex items-center gap-1 mb-1.5">
                      <q.icon className="w-3 h-3" style={{ color: q.color }} />
                      <span className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{q.value || '-'}</p>
                  </div>
                ))}
              </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={feedbacks.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  )
}
