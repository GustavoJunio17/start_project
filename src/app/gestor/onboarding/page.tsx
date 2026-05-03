'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
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
    await supabase.from('onboardings').insert({ colaborador_id: selectedColab, empresa_id: user.empresa_id, etapas: etapasObj, percentual_concluido: 0 })
    setDialogOpen(false); setSelectedColab(''); setEtapas([''])
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
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#00D4FF]" /> Onboarding
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
            <Plus className="w-4 h-4 mr-2" /> Novo Onboarding
          </DialogTrigger>
          <DialogContent className="bg-[#0A0E27] border-[#1e2a5e]">
            <DialogHeader><DialogTitle className="text-white">Criar Onboarding</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Colaborador</label>
                <Select value={selectedColab} onValueChange={v => v && setSelectedColab(v)}>
                  <SelectTrigger className="bg-[#111633] border-[#1e2a5e]"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Etapas</label>
                {etapas.map((etapa, i) => (
                  <input key={i} value={etapa} onChange={e => { const n = [...etapas]; n[i] = e.target.value; setEtapas(n) }}
                    placeholder={`Etapa ${i + 1}`}
                    className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors" />
                ))}
                <button type="button" onClick={() => setEtapas([...etapas, ''])}
                  className="px-3 py-1.5 border border-[#1e2a5e] text-gray-400 rounded-lg text-sm hover:border-[#00D4FF]/40 hover:text-white transition-all">
                  + Etapa
                </button>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all">Criar</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
          </div>
        ) : onboardings.map(onb => (
          <div key={onb.id} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-white text-sm">{(onb.colaborador as any)?.nome || 'Colaborador'}</p>
              <span className="text-xs text-[#00D4FF] font-medium">{onb.percentual_concluido}%</span>
            </div>
            <Progress value={onb.percentual_concluido} className="h-1.5 mb-4" />
            <div className="space-y-2">
              {onb.etapas.map((etapa, i) => (
                <button key={i} onClick={() => toggleEtapa(onb, i)}
                  className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-[#0A0E27] transition-colors">
                  {etapa.concluida
                    ? <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    : <Circle className="w-4 h-4 text-gray-600" />
                  }
                  <span className={`text-sm ${etapa.concluida ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                    {etapa.titulo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
