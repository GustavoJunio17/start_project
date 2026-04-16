'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
          <Card key={key} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span style={{ color }}>{label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-xs text-muted-foreground">{desc}</Label>
              <Textarea
                className="mt-2 bg-background border-border min-h-[80px]"
                value={values[key]}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                placeholder={desc}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        type="submit"
        className="mt-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Enviar Feedback'}
      </Button>
    </form>
  )
}
