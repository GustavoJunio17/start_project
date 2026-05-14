'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidaturaId?: string
  candidatoId?: string
  candidatoNome?: string
}

export function FeedbackCandidatoModal({ open, onOpenChange, candidaturaId, candidatoId, candidatoNome }: Props) {
  const [parar, setParar] = useState('')
  const [comecar, setComecar] = useState('')
  const [continuar, setContinuar] = useState('')
  const [acao, setAcao] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (enviar: boolean) => {
    if (!parar.trim() && !comecar.trim() && !continuar.trim() && !acao.trim()) {
      toast.error('Preencha pelo menos um campo')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/candidatos/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatura_id: candidaturaId,
          candidato_id: candidatoId,
          parar, comecar, continuar, acao,
          enviar,
        }),
      })
      if (res.ok) {
        toast.success(enviar ? 'Feedback enviado ao candidato' : 'Rascunho salvo')
        setParar(''); setComecar(''); setContinuar(''); setAcao('')
        onOpenChange(false)
      } else {
        toast.error('Erro ao salvar feedback')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Feedback para o Candidato
          </DialogTitle>
          <DialogDescription>{candidatoNome}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block text-red-400">Parar</Label>
            <Textarea value={parar} onChange={e => setParar(e.target.value)} rows={2} placeholder="O que recomendamos que pare de fazer..." className="bg-card border-border" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block text-green-400">Começar</Label>
            <Textarea value={comecar} onChange={e => setComecar(e.target.value)} rows={2} placeholder="O que pode começar a fazer..." className="bg-card border-border" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block text-[#00D4FF]">Continuar</Label>
            <Textarea value={continuar} onChange={e => setContinuar(e.target.value)} rows={2} placeholder="O que está fazendo bem e deve continuar..." className="bg-card border-border" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block text-purple-400">Ação Recomendada</Label>
            <Textarea value={acao} onChange={e => setAcao(e.target.value)} rows={2} placeholder="Próximos passos sugeridos..." className="bg-card border-border" />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button variant="outline" disabled={loading} onClick={() => submit(false)}>Salvar rascunho</Button>
            <Button disabled={loading} onClick={() => submit(true)} className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
              {loading ? 'Enviando...' : 'Enviar ao candidato'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
