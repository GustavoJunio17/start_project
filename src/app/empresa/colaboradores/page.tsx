'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DISCBars } from '@/components/disc/DISCChart'
import type { Colaborador, StatusColaborador } from '@/types/database'
import { Search, Plus, Upload } from 'lucide-react'

const STATUS_COLORS: Record<StatusColaborador, string> = {
  em_treinamento: 'bg-blue-500/20 text-blue-400',
  ativo: 'bg-green-500/20 text-green-400',
  desligado: 'bg-red-500/20 text-red-400',
}

export default function ColaboradoresPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [origemFilter, setOrigemFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nome: '', cargo: '', email: '' })
  const supabase = createClient()

  const loadColaboradores = async () => {
    if (!user?.empresa_id) return
    const { data } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('empresa_id', user.empresa_id)
      .order('nome')
    setColaboradores(data || [])
    setLoading(false)
  }

  useEffect(() => { loadColaboradores() }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) return
    setSaving(true)
    await supabase.from('colaboradores').insert({
      empresa_id: user.empresa_id,
      nome: form.nome,
      cargo: form.cargo,
      email: form.email,
      data_contratacao: new Date().toISOString().split('T')[0],
      origem: 'contratacao_direta',
      proxima_reavaliacao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setSaving(false)
    setDialogOpen(false)
    setForm({ nome: '', cargo: '', email: '' })
    loadColaboradores()
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.empresa_id) return

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })
      return row
    })

    for (const row of rows) {
      await supabase.from('colaboradores').insert({
        empresa_id: user.empresa_id,
        nome: row.nome || row.name || '',
        cargo: row.cargo || row.position || '',
        email: row.email || '',
        origem: 'importacao_planilha',
        data_contratacao: new Date().toISOString().split('T')[0],
        proxima_reavaliacao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
    loadColaboradores()
  }

  const filtered = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase()) || 
                          c.cargo?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter
    const matchesOrigem = origemFilter === 'todos' || c.origem === origemFilter
    
    return matchesSearch && matchesStatus && matchesOrigem
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground">{colaboradores.length} colaboradores</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <Button variant="outline" className="border-border">
              <Upload className="w-4 h-4 mr-2" /> Importar CSV
            </Button>
          </label>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
              <Plus className="w-4 h-4 mr-2" /> Novo
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Cadastrar Colaborador</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-background" />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou cargo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="em_treinamento">Em Treinamento</SelectItem>
            <SelectItem value="desligado">Desligado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={origemFilter} onValueChange={setOrigemFilter}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Origens</SelectItem>
            <SelectItem value="contratacao_direta">Contratação Direta</SelectItem>
            <SelectItem value="promocao">Promoção</SelectItem>
            <SelectItem value="importacao_planilha">Importação Planilha</SelectItem>
            <SelectItem value="processo_seletivo">Processo Seletivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Reavaliacao</TableHead>
                <TableHead>DISC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id} className="border-border">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.cargo || '-'}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.origem.replace('_', ' ')}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
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
