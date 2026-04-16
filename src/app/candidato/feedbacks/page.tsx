'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import type { Feedback } from '@/types/database'
import { MessageSquare, StopCircle, Play, RefreshCw, Zap } from 'lucide-react'

export default function CandidatoFeedbacksPage() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: candidaturas } = await supabase
        .from('candidatos')
        .select('id')
        .eq('user_id', user!.id)

      if (!candidaturas?.length) { setLoading(false); return }

      const ids = candidaturas.map(c => c.id)
      const { data } = await supabase
        .from('feedbacks')
        .select('*')
        .in('candidato_id', ids)
        .eq('visivel_para_candidato', true)
        .order('created_at', { ascending: false })

      setFeedbacks(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-[#00D4FF]" /> Feedbacks Recebidos
      </h1>

      {feedbacks.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum feedback disponivel no momento.
          </CardContent>
        </Card>
      ) : feedbacks.map(fb => (
        <Card key={fb.id} className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Recebido em {new Date(fb.created_at).toLocaleDateString('pt-BR')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Parar', value: fb.parar, icon: StopCircle, color: '#EF4444' },
                { label: 'Comecar', value: fb.comecar, icon: Play, color: '#10B981' },
                { label: 'Continuar', value: fb.continuar, icon: RefreshCw, color: '#0066FF' },
                { label: 'Acao', value: fb.acao, icon: Zap, color: '#F59E0B' },
              ].map(q => (
                <div key={q.label} className="p-3 rounded bg-background">
                  <div className="flex items-center gap-1 mb-1">
                    <q.icon className="w-3 h-3" style={{ color: q.color }} />
                    <span className="text-xs font-medium" style={{ color: q.color }}>{q.label}</span>
                  </div>
                  <p className="text-sm text-foreground">{q.value || '-'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
