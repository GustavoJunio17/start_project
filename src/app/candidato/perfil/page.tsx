'use client'

import { useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tema } from '@/types/database'
import { FileText, Save, User } from 'lucide-react'

export default function CandidatoPerfilPage() {
  const { user, refetch } = useAuth()
  const [nome, setNome] = useState(user?.nome_completo || '')
  const [telefone, setTelefone] = useState(user?.telefone || '')
  const [tema, setTema] = useState<Tema>(user?.tema_preferido || 'dark')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    await supabase.from('users').update({
      nome_completo: nome,
      telefone,
      tema_preferido: tema,
    }).eq('id', user.id)
    setSaving(false)
    setMessage('Perfil atualizado com sucesso!')
    refetch()
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePasswordChange = async () => {
    const newPassword = prompt('Nova senha (minimo 6 caracteres):')
    if (!newPassword || newPassword.length < 6) {
      setMessage('Senha deve ter no minimo 6 caracteres')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json()
      setMessage('Erro ao alterar senha: ' + data.error)
    } else {
      setMessage('Senha alterada com sucesso!')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <User className="w-6 h-6 text-[#00D4FF]" /> Meu Perfil
      </h1>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm">Dados Pessoais</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email || ''} disabled className="bg-background opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} className="bg-background" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select value={tema} onValueChange={v => setTema(v as Tema)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {message && <p className="text-sm text-[#10B981]">{message}</p>}

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={handlePasswordChange}>
                Alterar Senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
