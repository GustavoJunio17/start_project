'use client'

import { useState } from 'react'
import { createClient } from '@/lib/db/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Empresa, User } from '@/types/database'
import { Mail, Phone, Building2, Users, Trash2, Edit2, Plus } from 'lucide-react'

interface EmpresaDetailsModalProps {
  empresa: Empresa | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  onDeleted: () => void
}

export function EmpresaDetailsModal({
  empresa,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: EmpresaDetailsModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [colaboradores, setColaboradores] = useState<User[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({
    email: '',
    nome_completo: '',
    telefone: '',
  })
  const [editForm, setEditForm] = useState<Partial<Empresa>>({})

  const loadUsers = async () => {
    if (!empresa) return
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('empresa_id', empresa.id)
    setUsers(data || [])
    
    const owners = (data || []).filter(u => u.role === 'admin')
    const colabs = (data || []).filter(u => u.role === 'colaborador')
    setColaboradores(colabs)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return
    setLoading(true)

    try {
      // Create user via API
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userForm.email,
          nome_completo: userForm.nome_completo,
          telefone: userForm.telefone,
          role: 'admin',
          empresa_id: empresa.id,
        }),
      })

      if (response.ok) {
        setUserForm({ email: '', nome_completo: '', telefone: '' })
        setShowUserForm(false)
        loadUsers()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    await supabase.from('users').delete().eq('id', userId)
    loadUsers()
  }

  const handleEditEmpresa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return
    setLoading(true)

    try {
      await supabase
        .from('empresas')
        .update(editForm)
        .eq('id', empresa.id)
      
      setEditing(false)
      onUpdated()
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmpresa = async () => {
    if (!empresa) return
    setLoading(true)

    try {
      await supabase.from('empresas').delete().eq('id', empresa.id)
      onDeleted()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && empresa) {
      setEditForm({
        nome: empresa.nome,
        email_contato: empresa.email_contato || '',
        telefone: empresa.telefone || '',
        categoria: empresa.categoria || '',
      })
      loadUsers()
    } else {
      setEditing(false)
      setShowUserForm(false)
    }
    onOpenChange(newOpen)
  }

  if (!empresa) return null

  const ownerUser = users.find(u => u.role === 'admin')

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                {empresa.nome}
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              {!editing && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="border-border"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="detalhes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background border-border">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="dono">Dono</TabsTrigger>
              <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
            </TabsList>

            {/* Detalhes */}
            <TabsContent value="detalhes" className="space-y-4 mt-4">
              {editing ? (
                <form onSubmit={handleEditEmpresa} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={editForm.nome || ''}
                      onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input
                      value={editForm.categoria || ''}
                      onChange={e => setEditForm({ ...editForm, categoria: e.target.value })}
                      className="bg-background"
                      placeholder="Ex: Clínica, Loja"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={editForm.email_contato || ''}
                        onChange={e => setEditForm({ ...editForm, email_contato: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={editForm.telefone || ''}
                        onChange={e => setEditForm({ ...editForm, telefone: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="border-border"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Segmento</p>
                      <Badge variant="outline" className="mt-1">{empresa.segmento}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <p className="font-medium">{empresa.categoria || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-medium">{empresa.cnpj || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${empresa.status === 'ativa' ? 'bg-green-500/20 text-green-400' : empresa.status === 'inativa' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>
                        {empresa.status}
                      </Badge>
                    </div>
                  </div>

                  {empresa.email_contato && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{empresa.email_contato}</span>
                    </div>
                  )}

                  {empresa.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{empresa.telefone}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                    Cadastrado em: {new Date(empresa.data_cadastro).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Dono */}
            <TabsContent value="dono" className="space-y-4 mt-4">
              {ownerUser ? (
                <div className="bg-background p-4 rounded-lg border border-border space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{ownerUser.nome_completo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium break-all">{ownerUser.email}</p>
                  </div>
                  {ownerUser.telefone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{ownerUser.telefone}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(ownerUser.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-muted-foreground mb-4">Nenhum dono cadastrado</p>
                  <Button
                    onClick={() => setShowUserForm(true)}
                    className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Criar Dono
                  </Button>
                </div>
              )}

              {showUserForm && !ownerUser && (
                <form onSubmit={handleCreateUser} className="border-t border-border pt-4 space-y-4">
                  <h3 className="font-medium">Criar Usuário Dono</h3>
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={userForm.nome_completo}
                      onChange={e => setUserForm({ ...userForm, nome_completo: e.target.value })}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone (opcional)</Label>
                    <Input
                      value={userForm.telefone}
                      onChange={e => setUserForm({ ...userForm, telefone: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUserForm(false)}
                      className="border-border"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={loading}>
                      {loading ? 'Criando...' : 'Criar'}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* Colaboradores */}
            <TabsContent value="colaboradores" className="space-y-4 mt-4">
              {colaboradores.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-muted-foreground">Nenhum colaborador cadastrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {colaboradores.map(colab => (
                    <div key={colab.id} className="bg-background p-4 rounded-lg border border-border flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{colab.nome_completo}</p>
                        <p className="text-sm text-muted-foreground break-all">{colab.email}</p>
                        {colab.telefone && <p className="text-sm text-muted-foreground">{colab.telefone}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(colab.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      {showDeleteAlert && (
        <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Deletar Empresa</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Tem certeza que deseja deletar "{empresa.nome}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAlert(false)}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmpresa}
                disabled={loading}
              >
                {loading ? 'Deletando...' : 'Deletar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
