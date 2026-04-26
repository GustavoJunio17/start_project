'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RespostaTeste, TemplateTeste } from '@/types/database'
import { ClipboardList, Plus, Trash2, Package, Edit2 } from 'lucide-react'

const supabase = createClient()

export default function EmpresaTestesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [respostas, setRespostas] = useState<(RespostaTeste & { candidato?: { nome_completo: string } })[]>([])
  const [templates, setTemplates] = useState<TemplateTeste[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!user?.empresa_id) return
    const [resRes, templRes] = await Promise.all([
      supabase
        .from('respostas_teste')
        .select('*, candidato:candidatos(nome_completo)')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('templates_testes')
        .select('*')
        .eq('empresa_id', user.empresa_id),
    ])
    setRespostas(resRes.data || [])
    setTemplates(templRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user?.empresa_id) load()
  }, [user])

  const handleDeleteTemplate = async (id: string) => {
    await supabase.from('questoes_disc').delete().eq('template_testes_id', id)
    await supabase.from('templates_testes').delete().eq('id', id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-[#00D4FF]" /> Gestão de Testes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{respostas.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Testes realizados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-[#00D4FF]">{templates.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Templates de testes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">Resultados Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Candidato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                </TableRow>
              ) : respostas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum resultado ainda.
                  </TableCell>
                </TableRow>
              ) : respostas.map((r) => (
                <TableRow key={r.id} className="border-border">
                  <TableCell className="font-medium">{(r.candidato as { nome_completo: string } | undefined)?.nome_completo || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{r.tipo.toUpperCase()}</Badge></TableCell>
                  <TableCell className="font-medium">{r.score ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.duracao_segundos ? `${Math.floor(r.duracao_segundos / 60)}min` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-[#00D4FF]" /> Templates de Testes ({templates.length})
            </CardTitle>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
              onClick={() => router.push('/empresa/testes/novo-template')}
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum template. Crie o primeiro acima.
            </p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="p-4 rounded bg-background border border-border group relative cursor-pointer hover:border-[#00D4FF]/50 transition-colors" onClick={() => router.push(`/empresa/testes/${t.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.nome}</p>
                      {t.descricao && <p className="text-xs text-muted-foreground mt-1">{t.descricao}</p>}
                    </div>
                    <div className="ml-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/empresa/testes/${t.id}/editar`)
                        }}
                        className="text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                        title="Editar template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(t.id)
                        }}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                        title="Deletar template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground bg-foreground/5 inline-block px-2 py-1 rounded mt-2">
                    {t.questoes_ids.length} questões
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
