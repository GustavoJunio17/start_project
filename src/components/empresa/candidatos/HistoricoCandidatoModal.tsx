'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { History, Briefcase, FileCheck } from 'lucide-react'

interface CandidaturaHist {
  id: string
  vaga_id: string
  vaga_titulo: string
  vaga_categoria: string | null
  status: string
  created_at: string
}

interface TesteHist {
  id: string
  tipo: string
  score: number | null
  created_at: string
  template_nome: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  email?: string
  candidatoNome?: string
}

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  lido: 'Lido',
  rejeito: 'Rejeitado',
  contratado: 'Contratado',
  banco_talentos: 'Banco de Talentos',
}

export function HistoricoCandidatoModal({ open, onOpenChange, email, candidatoNome }: Props) {
  const [candidaturas, setCandidaturas] = useState<CandidaturaHist[]>([])
  const [testes, setTestes] = useState<TesteHist[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !email) return
    let cancelled = false
    const ac = new AbortController()
    Promise.resolve().then(() => {
      if (cancelled) return
      setLoading(true)
      fetch(`/api/candidatos/historico?email=${encodeURIComponent(email)}`, { signal: ac.signal })
        .then(r => r.ok ? r.json() : { candidaturas: [], testes: [] })
        .then(({ candidaturas, testes }) => {
          if (cancelled) return
          setCandidaturas(candidaturas || [])
          setTestes(testes || [])
        })
        .catch(() => {
          if (cancelled) return
          setCandidaturas([]); setTestes([])
        })
        .finally(() => { if (!cancelled) setLoading(false) })
    })
    return () => { cancelled = true; ac.abort() }
  }, [open, email])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#00D4FF]" />
            Histórico do Candidato
          </DialogTitle>
          <DialogDescription>{candidatoNome} ({email})</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Candidaturas ({candidaturas.length})</h3>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : candidaturas.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhuma candidatura anterior</p>
            ) : (
              <div className="space-y-2">
                {candidaturas.map(c => (
                  <div key={c.id} className="bg-secondary/30 rounded-lg p-3 border border-border flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.vaga_titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.vaga_categoria || '—'} · {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold border border-[#1e2a5e] text-gray-300 shrink-0 ml-3">
                      {statusLabel[c.status] || c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Testes Respondidos ({testes.length})</h3>
            </div>
            {testes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum teste respondido</p>
            ) : (
              <div className="space-y-2">
                {testes.map(t => (
                  <div key={t.id} className="bg-secondary/30 rounded-lg p-3 border border-border flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.template_nome || t.tipo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {t.score !== null && (
                      <span className="text-sm font-semibold text-[#00D4FF]">{t.score}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
