'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Colaborador } from '@/types/database'
import { Target, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ReavaliacaoPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('empresa_id', user!.empresa_id!)
        .neq('status', 'desligado')
        .order('proxima_reavaliacao', { ascending: true, nullsFirst: false })
      setColaboradores(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const isVencido = (date: string | null) => {
    if (!date) return false
    return new Date(date) <= new Date()
  }

  const isProximo = (date: string | null) => {
    if (!date) return false
    const diff = new Date(date).getTime() - Date.now()
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000 // 7 days
  }

  const vencidos = colaboradores.filter(c => isVencido(c.proxima_reavaliacao))
  const proximos = colaboradores.filter(c => isProximo(c.proxima_reavaliacao))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-6 h-6 text-[#00D4FF]" /> Ciclo de Reavaliacao (90 dias)
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border border-l-2 border-l-[#EF4444]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              <div>
                <p className="text-2xl font-bold text-foreground">{vencidos.length}</p>
                <p className="text-xs text-muted-foreground">Reavaliacoes vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-2 border-l-[#F59E0B]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#F59E0B]" />
              <div>
                <p className="text-2xl font-bold text-foreground">{proximos.length}</p>
                <p className="text-xs text-muted-foreground">Proximos 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm">Colaboradores</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proxima Reavaliacao</TableHead>
                <TableHead>DISC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : colaboradores.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{c.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{c.cargo || '-'}</TableCell>
                  <TableCell>
                    {isVencido(c.proxima_reavaliacao) ? (
                      <Badge className="bg-red-500/20 text-red-400">Vencido</Badge>
                    ) : isProximo(c.proxima_reavaliacao) ? (
                      <Badge className="bg-yellow-500/20 text-yellow-400">Proximo</Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400">Em dia</Badge>
                    )}
                  </TableCell>
                  <TableCell className={`text-sm ${isVencido(c.proxima_reavaliacao) ? 'text-[#EF4444] font-medium' : 'text-muted-foreground'}`}>
                    {c.proxima_reavaliacao ? new Date(c.proxima_reavaliacao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="w-40">
                    {c.perfil_disc ? <DISCBars perfil={c.perfil_disc} /> : <span className="text-xs text-muted-foreground">Pendente</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
