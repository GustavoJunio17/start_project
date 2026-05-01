'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Plus, MoreHorizontal, Edit, Trash, Search } from 'lucide-react'

const supabase = createClient()

interface CargoOuDepartamento {
  id: string
  empresa_id: string
  tipo: 'cargo' | 'departamento'
  nome: string
  descricao: string | null
  ativo: boolean
  created_at: string
}

export default function CargosDepartamentosPage() {
  const { user } = useAuth()
  const [cargos, setCargos] = useState<CargoOuDepartamento[]>([])
  const [departamentos, setDepartamentos] = useState<CargoOuDepartamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'cargo' | 'departamento'>('cargo')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    if (!user?.empresa_id) return
    setLoading(true)
    const { data } = await supabase
      .from('cargos_departamentos')
      .select('*')
      .eq('empresa_id', user.empresa_id)
      .order('nome')

    if (data) {
      setCargos(data.filter(d => d.tipo === 'cargo'))
      setDepartamentos(data.filter(d => d.tipo === 'departamento'))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user?.empresa_id])

  const handleOpenForm = (item?: CargoOuDepartamento) => {
    if (item) {
      setEditingId(item.id)
      setFormData({ nome: item.nome, descricao: item.descricao || '' })
    } else {
      setEditingId(null)
      setFormData({ nome: '', descricao: '' })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id || !formData.nome.trim()) return

    setSubmitting(true)
    try {
      const payload = {
        empresa_id: user.empresa_id,
        tipo: tab,
        nome: formData.nome.trim(),
        descricao: formData.descricao?.trim() || null,
        ativo: true,
      }

      if (editingId) {
        await supabase.from('cargos_departamentos').update(payload).eq('id', editingId)
      } else {
        await supabase.from('cargos_departamentos').insert([payload])
      }

      setIsFormOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('cargos_departamentos').delete().eq('id', id)
    fetchData()
  }

  const handleToggleActive = async (id: string, ativo: boolean) => {
    await supabase.from('cargos_departamentos').update({ ativo: !ativo }).eq('id', id)
    fetchData()
  }

  const items = tab === 'cargo' ? cargos : departamentos
  const filtered = items.filter(item => item.nome.toLowerCase().includes(search.toLowerCase()))

  const nomeAbrev = tab === 'cargo' ? 'Cargo' : 'Departamento'
  const nomePlural = tab === 'cargo' ? 'Cargos' : 'Departamentos'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cargos e Departamentos</h1>
          <p className="text-muted-foreground">Gerencie os cargos e departamentos da sua empresa</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'cargo' | 'departamento')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border">
          <TabsTrigger value="cargo">Cargos</TabsTrigger>
          <TabsTrigger value="departamento">Departamentos</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${nomePlural.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button
              className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
              onClick={() => handleOpenForm()}
            >
              <Plus className="w-4 h-4 mr-2" /> Novo {nomeAbrev}
            </Button>
          </div>

          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>{nomeAbrev}</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum {nomeAbrev.toLowerCase()} cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(item => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.descricao || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          className={item.ativo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
                          onClick={() => handleToggleActive(item.id, item.ativo)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(item)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Editar ${nomeAbrev}` : `Novo ${nomeAbrev}`}
            </DialogTitle>
            <DialogDescription>
              {editingId ? `Atualize os dados do ${nomeAbrev.toLowerCase()}.` : `Adicione um novo ${nomeAbrev.toLowerCase()} à sua empresa.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={formData.nome}
                onChange={e => setFormData(f => ({ ...f, nome: e.target.value }))}
                placeholder={`Ex: Desenvolvedor, TI, Financeiro...`}
                className="bg-card"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Textarea
                value={formData.descricao}
                onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva este cargo ou departamento"
                className="bg-card min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
