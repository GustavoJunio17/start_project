'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Vaga } from '@/types/database'
import { Search, Briefcase, Building2, MapPin, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CandidatoVagasPage() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<(Vaga & { empresa?: { nome: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedVaga, setSelectedVaga] = useState<(Vaga & { empresa?: { nome: string } }) | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState<string[]>([])
  const [cargoPretendido, setCargoPretendido] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: vagasData } = await supabase
        .from('vagas')
        .select('*, empresa:empresas(nome)')
        .eq('status', 'aberta')
        .eq('publica', true)
        .order('created_at', { ascending: false })

      setVagas(vagasData || [])

      // Check which vagas user already applied to
      if (user) {
        const { data: candidaturas } = await supabase
          .from('candidatos')
          .select('vaga_id')
          .eq('user_id', user.id)
        setApplied((candidaturas || []).map(c => c.vaga_id).filter(Boolean) as string[])
      }

      setLoading(false)
    }
    load()
  }, [user])

  const handleApply = async () => {
    if (!user || !selectedVaga) return
    setApplying(true)

    // Check 12-month restriction
    const { data: existing } = await supabase
      .from('candidatos')
      .select('id, data_ultimo_teste')
      .eq('user_id', user.id)
      .eq('empresa_id', selectedVaga.empresa_id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existing && existing.length > 0) {
      const lastTest = existing[0].data_ultimo_teste
      if (lastTest) {
        const monthsSince = (Date.now() - new Date(lastTest).getTime()) / (1000 * 60 * 60 * 24 * 30)
        if (monthsSince < 12) {
          setApplying(false)
          return
        }
      }
    }

    await supabase.from('candidatos').insert({
      user_id: user.id,
      empresa_id: selectedVaga.empresa_id,
      vaga_id: selectedVaga.id,
      nome_completo: user.nome_completo,
      email: user.email,
      whatsapp: user.telefone,
      cargo_pretendido: cargoPretendido || selectedVaga.titulo,
    })

    setApplied([...applied, selectedVaga.id])
    setApplying(false)
    setSelectedVaga(null)
    setCargoPretendido('')
  }

  const filtered = vagas.filter(v =>
    v.titulo.toLowerCase().includes(search.toLowerCase()) ||
    v.categoria?.toLowerCase().includes(search.toLowerCase()) ||
    (v.empresa as any)?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-[#00D4FF]" /> Vagas Disponiveis
      </h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar vagas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <Dialog open={!!selectedVaga} onOpenChange={open => !open && setSelectedVaga(null)}>
        <DialogContent className="bg-card border-border">
          {selectedVaga && (
            <>
              <DialogHeader><DialogTitle>{selectedVaga.titulo}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{(selectedVaga.empresa as any)?.nome}</span>
                </div>
                {selectedVaga.categoria && <Badge variant="outline">{selectedVaga.categoria}</Badge>}
                {selectedVaga.descricao && <p className="text-sm text-foreground">{selectedVaga.descricao}</p>}
                {selectedVaga.requisitos && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Requisitos:</p>
                    <p className="text-sm text-foreground">{selectedVaga.requisitos}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Cargo Pretendido</Label>
                  <Input
                    value={cargoPretendido}
                    onChange={e => setCargoPretendido(e.target.value)}
                    placeholder={selectedVaga.titulo}
                    className="bg-background"
                  />
                </div>
                <Button onClick={handleApply} className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={applying}>
                  {applying ? 'Candidatando...' : 'Candidatar-se'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Nenhuma vaga encontrada</p>
        ) : filtered.map(vaga => {
          const alreadyApplied = applied.includes(vaga.id)
          return (
            <Card key={vaga.id} className="bg-card border-border hover:border-[#00D4FF]/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{vaga.titulo}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Building2 className="w-3 h-3" />
                  <span>{(vaga.empresa as any)?.nome}</span>
                </div>
                {vaga.categoria && <Badge variant="outline" className="text-xs mb-2">{vaga.categoria}</Badge>}
                {vaga.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vaga.descricao}</p>}
                {alreadyApplied ? (
                  <Button disabled className="w-full" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#10B981]" /> Ja candidatado
                  </Button>
                ) : (
                  <Button onClick={() => setSelectedVaga(vaga)} className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
                    Candidatar-se
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
