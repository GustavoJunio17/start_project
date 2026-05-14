'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase } from 'lucide-react'
import { toast } from 'sonner'

interface Vaga {
  id: string
  titulo: string
  categoria?: string | null
  status: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidaturaOrigemId?: string
  candidatoId?: string
  candidatoNome?: string
  onSuccess?: () => void
}

export function ConvidarVagaModal({ open, onOpenChange, candidaturaOrigemId, candidatoId, candidatoNome, onSuccess }: Props) {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [vagaId, setVagaId] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch('/api/vagas')
      .then(r => r.ok ? r.json() : { data: [] })
      .then((res: { data?: Vaga[]; vagas?: Vaga[] } | Vaga[]) => {
        const list: Vaga[] = Array.isArray(res) ? res : (res.data || res.vagas || [])
        setVagas(list.filter(v => v.status === 'aberta'))
      })
      .catch(() => setVagas([]))
  }, [open])

  const submit = async () => {
    if (!vagaId) {
      toast.error('Selecione uma vaga')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/candidatos/convidar-vaga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaga_id: vagaId,
          candidatura_origem_id: candidaturaOrigemId,
          candidato_id: candidatoId,
          mensagem,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Candidato convidado para a vaga')
        onSuccess?.()
        onOpenChange(false)
        setVagaId(''); setMensagem('')
      } else {
        toast.error(data.error || 'Erro ao convidar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#00D4FF]" />
            Convidar para nova vaga
          </DialogTitle>
          <DialogDescription>{candidatoNome}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Selecione a vaga</Label>
            <Select value={vagaId} onValueChange={(v) => setVagaId(v || '')}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Escolha uma vaga aberta..." />
              </SelectTrigger>
              <SelectContent>
                {vagas.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground">Nenhuma vaga aberta disponível</div>
                ) : vagas.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Mensagem (opcional)</Label>
            <Textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={3} placeholder="Mensagem interna registrada na candidatura..." className="bg-card border-border" />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={loading || !vagaId} onClick={submit} className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
              {loading ? 'Convidando...' : 'Convidar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
