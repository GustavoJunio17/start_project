'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import type { Vaga, StatusVaga } from '@/types/database'
import { Plus, Briefcase, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

const ITEMS_PER_PAGE = 18

const STATUS_COLORS: Record<StatusVaga, string> = {
  rascunho: 'bg-blue-500/20 text-blue-400',
  aberta: 'bg-green-500/20 text-green-400',
  pausada: 'bg-yellow-500/20 text-yellow-400',
  encerrada: 'bg-red-500/20 text-red-400',
}

export default function VagasPage() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

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

  const totalPages = Math.ceil(vagas.length / ITEMS_PER_PAGE)
  const paginated = vagas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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
        ) : paginated.map(vaga => (
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
                {vaga.status === 'rascunho' ? (
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Confirmar
                  </span>
                ) : (
                  <span className="text-xs text-green-400">Publicada</span>
                )}
                <Select value={vaga.status} onValueChange={v => handleStatusChange(vaga.id, v as StatusVaga)}>
                  <SelectTrigger className="w-28 h-7 text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vaga.status === 'rascunho' && <SelectItem value="aberta">Confirmar</SelectItem>}
                    {vaga.status !== 'rascunho' && <SelectItem value="aberta">Aberta</SelectItem>}
                    {vaga.status !== 'rascunho' && <SelectItem value="pausada">Pausada</SelectItem>}
                    {vaga.status !== 'rascunho' && <SelectItem value="encerrada">Encerrada</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={vagas.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  )
}
