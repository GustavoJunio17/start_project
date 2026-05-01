'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types/database'
import { Settings, UserPlus, Shield, Copy, Check, Plus, Edit2, Trash2 } from 'lucide-react'
import { FormGestorRH } from '@/components/empresa/FormGestorRH'

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [gestores, setGestores] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('gestor_rh')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [isFormGestorOpen, setIsFormGestorOpen] = useState(false)
  const [selectedGestor, setSelectedGestor] = useState<User | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const res = await fetch('/api/empresa/gestores-rh')
      const data = await res.json()
      setGestores(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) return
    setSaving(true)
    setInviteLink('')
    try {
      const res = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (res.ok && data.inviteUrl) {
        setInviteLink(data.inviteUrl)
        setInviteEmail('')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGestorSaved = async () => {
    setIsFormGestorOpen(false)
    setSelectedGestor(null)
    const res = await fetch('/api/empresa/gestores-rh')
    const data = await res.json()
    setGestores(Array.isArray(data) ? data : [])
  }

  const handleEdit = (gestor: User) => {
    setSelectedGestor(gestor)
    setIsFormGestorOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/empresa/gestores-rh/${deleteConfirmId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao remover gestor')
      }
      await handleGestorSaved()
      setDeleteConfirmId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover gestor')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#00D4FF]" /> Configuracoes da Empresa
      </h1>

      {/* Gestores RH */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00D4FF]" /> Equipe de RH
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                onClick={() => setIsFormGestorOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Novo Gestor RH
              </Button>
              <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setInviteLink('') }}>
                <DialogTrigger render={<Button size="sm" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
                  <UserPlus className="w-4 h-4 mr-2" /> Convidar
                </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Convidar para a Equipe</DialogTitle></DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                      className="bg-background"
                      placeholder="colaborador@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Funcao</Label>
                    <Select value={inviteRole} onValueChange={v => v && setInviteRole(v)}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gestor_rh">Gestor de RH</SelectItem>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                    disabled={saving}
                  >
                    {saving ? 'Gerando link...' : 'Gerar Link de Convite'}
                  </Button>
                </form>
                {inviteLink && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs text-muted-foreground">Link de convite (valido por 7 dias):</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={inviteLink}
                        readOnly
                        className="bg-background text-xs font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Funcao</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : gestores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum membro na equipe.
                  </TableCell>
                </TableRow>
              ) : gestores.map(g => (
                <TableRow key={g.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{g.nome_completo}</TableCell>
                  <TableCell className="text-muted-foreground">{g.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500/20 text-blue-400">{g.role.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={g.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {g.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(g)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(g.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

{isFormGestorOpen && user?.empresa_id && (
        <FormGestorRH
          empresaId={user.empresa_id}
          onClose={() => {
            setIsFormGestorOpen(false)
            setSelectedGestor(null)
          }}
          onSaved={handleGestorSaved}
          gestor={selectedGestor || undefined}
        />
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={open => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remover Gestor RH</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover este gestor? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
