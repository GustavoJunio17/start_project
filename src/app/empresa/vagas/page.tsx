'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { Vaga, StatusVaga } from '@/types/database'
import { Plus, Briefcase, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<StatusVaga, string> = {
  aberta: 'bg-green-500/20 text-green-400',
  pausada: 'bg-yellow-500/20 text-yellow-400',
  encerrada: 'bg-red-500/20 text-red-400',
}

export default function VagasPage() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadVagas = async () => {
    if (!user?.empresa_id) return
    const { data } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', user.empresa_id)
      .order('created_at', { ascending: false })
    setVagas(data || [])
    setLoading(false)
  }

  useEffect(() => { loadVagas() }, [user])

  const handleStatusChange = async (id: string, status: StatusVaga) => {
    await supabase.from('vagas').update({ status }).eq('id', id)
    loadVagas()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vagas</h1>
          <p className="text-muted-foreground">{vagas.length} vagas cadastradas</p>
        </div>
        <Link href="/empresa/vagas/nova">
          <Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
            <Plus className="w-4 h-4 mr-2" /> Nova Vaga
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Carregando...</p>
        ) : vagas.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Nenhuma vaga cadastrada ainda.</p>
        ) : vagas.map(vaga => (
          <Card key={vaga.id} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-foreground">{vaga.titulo}</h3>
                </div>
                <Badge className={STATUS_COLORS[vaga.status]}>{vaga.status}</Badge>
              </div>
              {vaga.categoria && <Badge variant="outline" className="mb-2 text-xs">{vaga.categoria}</Badge>}
              {vaga.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vaga.descricao}</p>}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {vaga.publica ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {vaga.publica ? 'Publica' : 'Privada'}
                </div>
                <Select value={vaga.status} onValueChange={v => handleStatusChange(vaga.id, v as StatusVaga)}>
                  <SelectTrigger className="w-28 h-7 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberta">Aberta</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="encerrada">Encerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
