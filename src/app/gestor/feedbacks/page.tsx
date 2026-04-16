'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { QuadranteFeedback } from '@/components/feedback/QuadranteFeedback'
import type { Feedback, Colaborador, Candidato, TipoFeedback } from '@/types/database'
import { Plus, MessageSquare, StopCircle, Play, RefreshCw, Zap } from 'lucide-react'

export default function GestorFeedbacksPage() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [colaboradores, setColaboradores] = useState<Pick<Colaborador, 'id' | 'nome'>[]>([])
  const [candidatos, setCandidatos] = useState<Pick<Candidato, 'id' | 'nome_completo'>[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tipo, setTipo] = useState<TipoFeedback>('interno_colaborador')
  const [targetId, setTargetId] = useState('')
  const [visivel, setVisivel] = useState(false)
  const supabase = createClient()

  const loadAll = async () => {
    if (!user?.empresa_id) return
    const [fbRes, colRes, candRes] = await Promise.all([
      supabase.from('feedbacks').select('*').eq('empresa_id', user.empresa_id).order('created_at', { ascending: false }),
      supabase.from('colaboradores').select('id, nome').eq('empresa_id', user.empresa_id),
      supabase.from('candidatos').select('id, nome_completo').eq('empresa_id', user.empresa_id),
    ])
    setFeedbacks(fbRes.data || [])
    setColaboradores(colRes.data || [])
    setCandidatos(candRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [user])

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
    loadAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
            <Plus className="w-4 h-4 mr-2" /> Novo Feedback
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader><DialogTitle>Enviar Feedback</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={v => { setTipo(v as TipoFeedback); setTargetId('') }}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interno_colaborador">Colaborador</SelectItem>
                      <SelectItem value="externo_candidato">Candidato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Destinatario</Label>
                  <Select value={targetId} onValueChange={v => v && setTargetId(v)}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {tipo === 'interno_colaborador'
                        ? colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)
                        : candidatos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {tipo === 'externo_candidato' && (
                <div className="flex items-center gap-2">
                  <Switch checked={visivel} onCheckedChange={setVisivel} />
                  <Label className="text-sm">Visivel para o candidato</Label>
                </div>
              )}
              <QuadranteFeedback onSubmit={handleSubmit} loading={saving} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : feedbacks.length === 0 ? (
          <Card className="bg-card border-border"><CardContent className="py-8 text-center text-muted-foreground">Nenhum feedback enviado</CardContent></Card>
        ) : feedbacks.map(fb => (
          <Card key={fb.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                <span className="text-xs text-muted-foreground">
                  {fb.tipo === 'interno_colaborador' ? 'Colaborador' : 'Candidato'} - {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Parar', value: fb.parar, icon: StopCircle, color: '#EF4444' },
                  { label: 'Comecar', value: fb.comecar, icon: Play, color: '#10B981' },
                  { label: 'Continuar', value: fb.continuar, icon: RefreshCw, color: '#0066FF' },
                  { label: 'Acao', value: fb.acao, icon: Zap, color: '#F59E0B' },
                ].map(q => (
                  <div key={q.label} className="p-2 rounded bg-background">
                    <div className="flex items-center gap-1 mb-1">
                      <q.icon className="w-3 h-3" style={{ color: q.color }} />
                      <span className="text-xs font-medium" style={{ color: q.color }}>{q.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{q.value || '-'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
