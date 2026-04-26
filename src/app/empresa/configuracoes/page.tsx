'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { User, Tema } from '@/types/database'
import { Settings, UserPlus, Shield, Copy, Check } from 'lucide-react'

const supabase = createClient()

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
  const [tema, setTema] = useState<Tema>('dark')

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('empresa_id', user!.empresa_id!)
        .in('role', ['user_empresa', 'gestor_rh'])
      setGestores(data || [])
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

  const handleThemeChange = async (newTema: Tema) => {
    setTema(newTema)
    if (user?.empresa_id) {
      await supabase.from('empresas').update({ tema_padrao: newTema }).eq('id', user.empresa_id)
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
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Funcao</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : gestores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tema */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm">Tema da Empresa</CardTitle></CardHeader>
        <CardContent>
          <Select value={tema} onValueChange={v => v && handleThemeChange(v as Tema)}>
            <SelectTrigger className="w-48 bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="clean">Clean</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
