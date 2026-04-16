'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RespostaTeste, QuestaoDisc } from '@/types/database'
import { ClipboardList, Plus } from 'lucide-react'

export default function GestorTestesPage() {
  const { user } = useAuth()
  const [respostas, setRespostas] = useState<(RespostaTeste & { candidato?: { nome_completo: string } })[]>([])
  const [questoes, setQuestoes] = useState<QuestaoDisc[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ pergunta: '', opcao_d: '', opcao_i: '', opcao_s: '', opcao_c: '' })
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const [resRes, questRes] = await Promise.all([
        supabase.from('respostas_teste').select('*, candidato:candidatos(nome_completo)').order('created_at', { ascending: false }).limit(50),
        supabase.from('questoes_disc').select('*').or(`empresa_id.eq.${user!.empresa_id},empresa_id.is.null`),
      ])
      setRespostas(resRes.data || [])
      setQuestoes(questRes.data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) return
    setSaving(true)
    await supabase.from('questoes_disc').insert({
      empresa_id: user.empresa_id,
      pergunta: form.pergunta,
      opcoes: [
        { texto: form.opcao_d, dimensao: 'D' },
        { texto: form.opcao_i, dimensao: 'I' },
        { texto: form.opcao_s, dimensao: 'S' },
        { texto: form.opcao_c, dimensao: 'C' },
      ],
    })
    setSaving(false)
    setDialogOpen(false)
    setForm({ pergunta: '', opcao_d: '', opcao_i: '', opcao_s: '', opcao_c: '' })
    const { data } = await supabase.from('questoes_disc').select('*').or(`empresa_id.eq.${user.empresa_id},empresa_id.is.null`)
    setQuestoes(data || [])
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-[#00D4FF]" /> Gestao de Testes
      </h1>

      {/* Resultados recentes */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm">Resultados Recentes</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Candidato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duracao</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : respostas.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum resultado</TableCell></TableRow>
              ) : respostas.map(r => (
                <TableRow key={r.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{(r.candidato as any)?.nome_completo || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{r.tipo.toUpperCase()}</Badge></TableCell>
                  <TableCell className="text-foreground font-medium">{r.score ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{r.duracao_segundos ? `${Math.floor(r.duracao_segundos / 60)}min` : '-'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Banco de questoes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Banco de Questoes DISC ({questoes.length})</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
                <Plus className="w-4 h-4 mr-2" /> Nova Questao
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Criar Questao DISC</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pergunta</Label>
                    <Textarea value={form.pergunta} onChange={e => setForm({ ...form, pergunta: e.target.value })} required className="bg-background" />
                  </div>
                  {[
                    { key: 'opcao_d', label: 'Opcao D (Dominancia)', color: '#EF4444' },
                    { key: 'opcao_i', label: 'Opcao I (Influencia)', color: '#F59E0B' },
                    { key: 'opcao_s', label: 'Opcao S (Estabilidade)', color: '#10B981' },
                    { key: 'opcao_c', label: 'Opcao C (Conformidade)', color: '#0066FF' },
                  ].map(o => (
                    <div key={o.key} className="space-y-1">
                      <Label className="text-xs" style={{ color: o.color }}>{o.label}</Label>
                      <Input value={form[o.key as keyof typeof form]} onChange={e => setForm({ ...form, [o.key]: e.target.value })} required className="bg-background" />
                    </div>
                  ))}
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
                    {saving ? 'Salvando...' : 'Criar Questao'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questoes.map(q => (
              <div key={q.id} className="p-3 rounded bg-background border border-border">
                <p className="text-sm text-foreground font-medium mb-2">{q.pergunta}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.opcoes.map((op, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      <span className="font-medium" style={{ color: op.dimensao === 'D' ? '#EF4444' : op.dimensao === 'I' ? '#F59E0B' : op.dimensao === 'S' ? '#10B981' : '#0066FF' }}>
                        {op.dimensao}:
                      </span> {op.texto}
                    </p>
                  ))}
                </div>
                {!q.empresa_id && <Badge variant="outline" className="mt-2 text-xs">Global</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
