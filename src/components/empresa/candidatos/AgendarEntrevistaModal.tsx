'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Video, MapPin, Trash } from 'lucide-react'
import { toast } from 'sonner'

interface Agendamento {
  id: string
  data_hora: string
  tipo: 'online' | 'presencial'
  link_reuniao: string | null
  endereco: string | null
  observacoes: string | null
  status: string
  gestor_nome?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidaturaId?: string
  candidatoId?: string
  candidatoNome?: string
}

export function AgendarEntrevistaModal({ open, onOpenChange, candidaturaId, candidatoId, candidatoNome }: Props) {
  const [data, setData] = useState('')
  const [hora, setHora] = useState('14:00')
  const [tipo, setTipo] = useState<'online' | 'presencial'>('online')
  const [link, setLink] = useState('')
  const [endereco, setEndereco] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])

  const param = candidaturaId
    ? `candidatura_id=${candidaturaId}`
    : candidatoId ? `candidato_id=${candidatoId}` : null

  useEffect(() => {
    if (!open || !param) return
    fetch(`/api/agendamentos?${param}`)
      .then(r => r.ok ? r.json() : [])
      .then(setAgendamentos)
      .catch(() => setAgendamentos([]))
  }, [open, param])

  const submit = async () => {
    if (!data || !hora) {
      toast.error('Informe data e hora')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatura_id: candidaturaId,
          candidato_id: candidatoId,
          data_hora: new Date(`${data}T${hora}`).toISOString(),
          tipo,
          link_reuniao: tipo === 'online' ? link : null,
          endereco: tipo === 'presencial' ? endereco : null,
          observacoes,
        }),
      })
      if (res.ok) {
        toast.success('Entrevista agendada')
        const newAg = await res.json()
        setAgendamentos(prev => [newAg.agendamento, ...prev])
        setData(''); setHora('14:00'); setLink(''); setEndereco(''); setObservacoes('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erro ao agendar')
      }
    } finally {
      setLoading(false)
    }
  }

  const remover = async (id: string) => {
    if (!confirm('Cancelar este agendamento?')) return
    const res = await fetch(`/api/agendamentos?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAgendamentos(prev => prev.filter(a => a.id !== id))
      toast.success('Agendamento removido')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00D4FF]" />
            Agendar Entrevista
          </DialogTitle>
          <DialogDescription>{candidatoNome}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Data</Label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} className="bg-card border-border" />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Hora</Label>
              <Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="bg-card border-border" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Modalidade</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo('online')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${tipo === 'online' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-border bg-card text-muted-foreground'}`}
              >
                <Video className="w-4 h-4" /> Online
              </button>
              <button
                type="button"
                onClick={() => setTipo('presencial')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${tipo === 'presencial' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-border bg-card text-muted-foreground'}`}
              >
                <MapPin className="w-4 h-4" /> Presencial
              </button>
            </div>
          </div>

          {tipo === 'online' ? (
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Link da reunião</Label>
              <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/..." className="bg-card border-border" />
            </div>
          ) : (
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Endereço</Label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, cidade" className="bg-card border-border" />
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Observações</Label>
            <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} className="bg-card border-border" />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={loading} onClick={submit} className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
              {loading ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>

          {agendamentos.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Agendamentos anteriores</p>
              <div className="space-y-2">
                {agendamentos.map(a => (
                  <div key={a.id} className="bg-secondary/30 rounded-lg p-3 border border-border flex items-start gap-3">
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-medium text-foreground">
                        {new Date(a.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.tipo === 'online' ? '🎥 Online' : '📍 Presencial'} · {a.status}</p>
                      {a.link_reuniao && <a href={a.link_reuniao} target="_blank" rel="noreferrer" className="text-xs text-[#00D4FF] hover:underline break-all">{a.link_reuniao}</a>}
                      {a.endereco && <p className="text-xs text-muted-foreground">{a.endereco}</p>}
                      {a.observacoes && <p className="text-xs text-muted-foreground italic mt-1">{a.observacoes}</p>}
                    </div>
                    <button onClick={() => remover(a.id)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
