'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TreinamentoIA } from '@/types/database'
import { GraduationCap, BookOpen } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400',
  em_andamento: 'bg-blue-500/20 text-blue-400',
  concluido: 'bg-green-500/20 text-green-400',
}

export default function CandidatoTreinamentoPage() {
  const { user } = useAuth()
  const [treinamentos, setTreinamentos] = useState<TreinamentoIA[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      // Check if user is a colaborador
      const { data: colabs } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('user_id', user!.id)

      if (!colabs?.length) { setLoading(false); return }

      const ids = colabs.map(c => c.id)
      const { data } = await supabase
        .from('treinamentos_ia')
        .select('*')
        .in('colaborador_id', ids)
        .order('created_at', { ascending: false })

      setTreinamentos(data || [])
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
        <GraduationCap className="w-6 h-6 text-[#00D4FF]" /> Trilha de Treinamento
      </h1>

      {treinamentos.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Nenhum treinamento disponivel no momento.</p>
            <p className="text-xs mt-1">Treinamentos serao gerados apos sua aprovacao em uma vaga.</p>
          </CardContent>
        </Card>
      ) : treinamentos.map(t => (
        <Card key={t.id} className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t.cargo || 'Treinamento'}</CardTitle>
              <Badge className={STATUS_COLORS[t.status]}>{t.status.replace('_', ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {t.gerado_por_ia && <Badge variant="outline" className="mb-2 text-xs">Gerado por IA</Badge>}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-sm text-foreground whitespace-pre-wrap">{t.conteudo_gerado || 'Conteudo em geracao...'}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
