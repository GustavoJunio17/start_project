'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StickyNote, Trash } from 'lucide-react'
import { toast } from 'sonner'

interface Observacao {
  id: string
  texto: string
  created_at: string
  autor_nome?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidaturaId?: string
  candidatoId?: string
  candidatoNome?: string
}

export function ObservacaoInternaModal({ open, onOpenChange, candidaturaId, candidatoId, candidatoNome }: Props) {
  const [texto, setTexto] = useState('')
  const [obs, setObs] = useState<Observacao[]>([])
  const [loading, setLoading] = useState(false)

  const param = candidaturaId
    ? `candidatura_id=${candidaturaId}`
    : candidatoId ? `candidato_id=${candidatoId}` : null

  useEffect(() => {
    if (!open || !param) return
    fetch(`/api/observacoes?${param}`)
      .then(r => r.ok ? r.json() : [])
      .then(setObs)
      .catch(() => setObs([]))
  }, [open, param])

  const submit = async () => {
    if (!texto.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/observacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidatura_id: candidaturaId, candidato_id: candidatoId, texto }),
      })
      if (res.ok) {
        const { observacao } = await res.json()
        setObs(prev => [observacao, ...prev])
        setTexto('')
        toast.success('Observação registrada')
      } else {
        toast.error('Erro ao salvar')
      }
    } finally {
      setLoading(false)
    }
  }

  const remover = async (id: string) => {
    if (!confirm('Remover observação?')) return
    const res = await fetch(`/api/observacoes?id=${id}`, { method: 'DELETE' })
    if (res.ok) setObs(prev => prev.filter(o => o.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-400" />
            Observações Internas
          </DialogTitle>
          <DialogDescription>
            {candidatoNome} — visíveis apenas para a equipe da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Anote algo sobre este candidato..."
              rows={3}
              className="bg-card border-border"
            />
            <div className="flex justify-end mt-2">
              <Button disabled={loading || !texto.trim()} onClick={submit} size="sm" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
                {loading ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </div>

          {obs.length > 0 ? (
            <div className="space-y-2 pt-3 border-t border-border">
              {obs.map(o => (
                <div key={o.id} className="bg-secondary/30 rounded-lg p-3 border border-border flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">{o.texto}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {o.autor_nome || 'Equipe'} · {new Date(o.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button onClick={() => remover(o.id)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma observação ainda</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
