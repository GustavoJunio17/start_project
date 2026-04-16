'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { Onboarding, Colaborador } from '@/types/database'
import { GraduationCap, Plus, CheckCircle, Circle } from 'lucide-react'

export default function OnboardingPage() {
  const { user } = useAuth()
  const [onboardings, setOnboardings] = useState<(Onboarding & { colaborador?: { nome: string } })[]>([])
  const [colaboradores, setColaboradores] = useState<Pick<Colaborador, 'id' | 'nome'>[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedColab, setSelectedColab] = useState('')
  const [etapas, setEtapas] = useState<string[]>([''])
  const supabase = createClient()

  const loadData = async () => {
    if (!user?.empresa_id) return
    const [onbRes, colRes] = await Promise.all([
      supabase.from('onboardings').select('*, colaborador:colaboradores(nome)').eq('empresa_id', user.empresa_id).order('created_at', { ascending: false }),
      supabase.from('colaboradores').select('id, nome').eq('empresa_id', user.empresa_id).eq('status', 'em_treinamento'),
    ])
    setOnboardings(onbRes.data || [])
    setColaboradores(colRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id || !selectedColab) return
    const etapasObj = etapas.filter(e => e.trim()).map(titulo => ({ titulo, concluida: false, data: null }))
    await supabase.from('onboardings').insert({
      colaborador_id: selectedColab,
      empresa_id: user.empresa_id,
      etapas: etapasObj,
      percentual_concluido: 0,
    })
    setDialogOpen(false)
    setSelectedColab('')
    setEtapas([''])
    loadData()
  }

  const toggleEtapa = async (onboarding: Onboarding & { colaborador?: { nome: string } }, index: number) => {
    const newEtapas = [...onboarding.etapas]
    newEtapas[index] = { ...newEtapas[index], concluida: !newEtapas[index].concluida, data: !newEtapas[index].concluida ? new Date().toISOString() : null }
    const concluidas = newEtapas.filter(e => e.concluida).length
    const percentual = Math.round((concluidas / newEtapas.length) * 100)
    await supabase.from('onboardings').update({ etapas: newEtapas, percentual_concluido: percentual }).eq('id', onboarding.id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#00D4FF]" /> Onboarding
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
            <Plus className="w-4 h-4 mr-2" /> Novo Onboarding
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Criar Onboarding</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Select value={selectedColab} onValueChange={v => v && setSelectedColab(v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Etapas</Label>
                {etapas.map((etapa, i) => (
                  <Input key={i} value={etapa} onChange={e => { const n = [...etapas]; n[i] = e.target.value; setEtapas(n) }} placeholder={`Etapa ${i + 1}`} className="bg-background" />
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setEtapas([...etapas, ''])}>+ Etapa</Button>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">Criar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : onboardings.map(onb => (
          <Card key={onb.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{(onb.colaborador as any)?.nome || 'Colaborador'}</CardTitle>
                <span className="text-xs text-[#00D4FF] font-medium">{onb.percentual_concluido}%</span>
              </div>
              <Progress value={onb.percentual_concluido} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {onb.etapas.map((etapa, i) => (
                  <button
                    key={i}
                    onClick={() => toggleEtapa(onb, i)}
                    className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-background transition-colors"
                  >
                    {etapa.concluida
                      ? <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      : <Circle className="w-4 h-4 text-muted-foreground" />
                    }
                    <span className={`text-sm ${etapa.concluida ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {etapa.titulo}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
