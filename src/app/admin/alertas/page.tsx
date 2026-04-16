'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AlertaAutomatico } from '@/types/database'
import { Bell, CheckCircle, AlertTriangle, Clock, Target } from 'lucide-react'

const TIPO_CONFIG = {
  candidato_score_baixo: { label: 'Score Baixo', icon: AlertTriangle, color: '#EF4444' },
  teste_pendente: { label: 'Teste Pendente', icon: Clock, color: '#F59E0B' },
  feedback_atrasado: { label: 'Feedback Atrasado', icon: Target, color: '#0066FF' },
  reavaliacao_vencida: { label: 'Reavaliacao Vencida', icon: Bell, color: '#8B5CF6' },
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaAutomatico[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadAlertas = async () => {
    const { data } = await supabase
      .from('alertas_automaticos')
      .select('*')
      .order('created_at', { ascending: false })
    setAlertas(data || [])
    setLoading(false)
  }

  useEffect(() => { loadAlertas() }, [])

  const markAsRead = async (id: string) => {
    await supabase.from('alertas_automaticos').update({ lido: true }).eq('id', id)
    loadAlertas()
  }

  const naoLidos = alertas.filter(a => !a.lido).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00D4FF]" /> Alertas do Sistema
          </h1>
          <p className="text-muted-foreground">{naoLidos} alertas nao lidos</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : alertas.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum alerta no momento
            </CardContent>
          </Card>
        ) : alertas.map(alerta => {
          const config = TIPO_CONFIG[alerta.tipo]
          const Icon = config.icon
          return (
            <Card key={alerta.id} className={`bg-card border-border ${!alerta.lido ? 'border-l-2' : ''}`} style={{ borderLeftColor: !alerta.lido ? config.color : undefined }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                        {config.label}
                      </Badge>
                      {!alerta.lido && <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />}
                    </div>
                    <p className="text-sm text-foreground mt-1">{alerta.mensagem}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alerta.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                {!alerta.lido && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(alerta.id)}>
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
