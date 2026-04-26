'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Empresa, User } from '@/types/database'
import { Mail, Phone, Building2, Users, Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react'

export default function EmpresaDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const empresaId = params.id as string

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [colaboradores, setColaboradores] = useState<User[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userForm, setUserForm] = useState({
    email: '',
    nome_completo: '',
    telefone: '',
  })
  const [editForm, setEditForm] = useState<Partial<Empresa>>({})
  const supabase = createClient()

  const STATUS_COLORS: Record<string, string> = {
    ativa: 'bg-green-500/20 text-green-400 border-green-500/30',
    inativa: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    bloqueada: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const loadEmpresa = async () => {
    const { data } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single()
    
    if (data) {
      setEmpresa(data)
      setEditForm({
        nome: data.nome,
        email_contato: data.email_contato || '',
        telefone: data.telefone || '',
        categoria: data.categoria || '',
      })
    }
    setLoading(false)
  }

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('empresa_id', empresaId)
    
    const allUsers = data || []
    setUsers(allUsers)
    setColaboradores(allUsers.filter(u => u.role === 'colaborador'))
  }

  useEffect(() => {
    loadEmpresa()
    loadUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userForm.email,
          nome_completo: userForm.nome_completo,
          telefone: userForm.telefone,
          role: 'user_empresa',
          empresa_id: empresaId,
        }),
      })

      if (response.ok) {
        setUserForm({ email: '', nome_completo: '', telefone: '' })
        setShowUserForm(false)
        loadUsers()
      }
    } finally {
      setSaving(false)
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
    setSaving(true)

    try {
      await supabase
        .from('empresas')
        .update(editForm)
        .eq('id', empresa.id)
      
      setEditing(false)
      loadEmpresa()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEmpresa = async () => {
    if (!empresa || !confirm('Tem certeza que deseja deletar esta empresa?')) return
    setSaving(true)

    try {
      await supabase.from('empresas').delete().eq('id', empresa.id)
      router.push('/admin/empresas')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Empresa não encontrada</p>
      </div>
    )
  }

  const ownerUser = users.find(u => u.role === 'user_empresa')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-background"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{empresa.nome}</h1>
                {empresa.categoria && (
                  <p className="text-sm text-muted-foreground">{empresa.categoria}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="border-border"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background border-border">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="dono">Dono</TabsTrigger>
          <TabsTrigger value="colaboradores">Colaboradores ({colaboradores.length})</TabsTrigger>
        </TabsList>

        {/* Detalhes */}
        <TabsContent value="detalhes" className="space-y-4 mt-4">
          {editing ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
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
                    <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Segmento</p>
                    <Badge variant="outline" className="border-border text-base">{empresa.segmento}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge className={`text-base ${STATUS_COLORS[empresa.status]}`}>
                      {empresa.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
                    <p className="font-medium">{empresa.cnpj || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                    <p className="font-medium">{empresa.categoria || '-'}</p>
                  </div>
                </div>

                {empresa.email_contato && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{empresa.email_contato}</span>
                  </div>
                )}

                {empresa.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{empresa.telefone}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                  Cadastrado em: {new Date(empresa.data_cadastro).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dono */}
        <TabsContent value="dono" className="space-y-4 mt-4">
          {ownerUser ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{ownerUser.nome_completo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium break-all">{ownerUser.email}</p>
                  </div>
                </div>
                {ownerUser.telefone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{ownerUser.telefone}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(ownerUser.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground mb-4">Nenhum dono cadastrado</p>
                <Button
                  onClick={() => setShowUserForm(true)}
                  className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                >
                  <Plus className="w-4 h-4 mr-2" /> Criar Dono
                </Button>
              </CardContent>
            </Card>
          )}

          {showUserForm && !ownerUser && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Criar Usuário Dono</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
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
                    <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
                      {saving ? 'Criando...' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Colaboradores */}
        <TabsContent value="colaboradores" className="space-y-4 mt-4">
          {colaboradores.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">Nenhum colaborador cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {colaboradores.map(colab => (
                <Card key={colab.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{colab.nome_completo}</p>
                      <p className="text-sm text-muted-foreground break-all">{colab.email}</p>
                      {colab.telefone && <p className="text-sm text-muted-foreground">{colab.telefone}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteUser(colab.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Alert */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card border-border max-w-md">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Deletar Empresa</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Tem certeza que deseja deletar "{empresa.nome}"? Esta ação não pode ser desfeita.
                </p>
              </div>
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
                  disabled={saving}
                >
                  {saving ? 'Deletando...' : 'Deletar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
