'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StopCircle, Play, RefreshCw, Zap } from 'lucide-react'

interface QuadranteFeedbackProps {
  onSubmit: (data: { parar: string; comecar: string; continuar: string; acao: string }) => void
  loading?: boolean
  initialValues?: { parar: string; comecar: string; continuar: string; acao: string }
}

const QUADRANTES = [
  { key: 'parar', label: 'Parar', desc: 'O que deve parar de fazer?', icon: StopCircle, color: '#EF4444' },
  { key: 'comecar', label: 'Comecar', desc: 'O que deve comecar a fazer?', icon: Play, color: '#10B981' },
  { key: 'continuar', label: 'Continuar', desc: 'O que deve continuar fazendo?', icon: RefreshCw, color: '#0066FF' },
  { key: 'acao', label: 'Acao', desc: 'Proxima acao concreta', icon: Zap, color: '#F59E0B' },
] as const

export function QuadranteFeedback({ onSubmit, loading, initialValues }: QuadranteFeedbackProps) {
  const [values, setValues] = useState(
    initialValues || { parar: '', comecar: '', continuar: '', acao: '' }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTES.map(({ key, label, desc, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-card overflow-hidden"
            style={{ borderLeftWidth: 4, borderLeftColor: color }}
          >
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
              <span className="text-sm font-semibold" style={{ color }}>{label}</span>
            </div>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-2">{desc}</p>
              <Textarea
                className="bg-background border-border min-h-[96px] resize-none text-sm"
                value={values[key]}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                placeholder={desc}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-5">
        <Button
          type="submit"
          className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] px-8"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Feedback'}
        </Button>
      </div>
    </form>
  )
}
