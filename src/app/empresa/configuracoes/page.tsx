'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { User, Tema } from '@/types/database'
import { Settings, UserPlus, Shield } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [gestores, setGestores] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [tema, setTema] = useState<Tema>('dark')
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('empresa_id', user!.empresa_id!)
        .eq('role', 'colaborador')
      setGestores(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) return
    setSaving(true)
    await supabase.from('convites').insert({
      email: inviteEmail,
      role: 'colaborador',
      empresa_id: user.empresa_id,
      criado_por: user.id,
    })
    setSaving(false)
    setDialogOpen(false)
    setInviteEmail('')
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
              <Shield className="w-4 h-4 text-[#00D4FF]" /> Gestores de RH
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />}>
                <UserPlus className="w-4 h-4 mr-2" /> Convidar
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Convidar Gestor RH</DialogTitle></DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label>E-mail do Gestor</Label>
                    <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required className="bg-background" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
                    {saving ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </form>
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
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gestores.map(g => (
                <TableRow key={g.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{g.nome_completo}</TableCell>
                  <TableCell className="text-muted-foreground">{g.email}</TableCell>
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
          <Select value={tema} onValueChange={v => handleThemeChange(v as Tema)}>
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
