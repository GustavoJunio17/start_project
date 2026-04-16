'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { User, Empresa, Permissoes } from '@/types/database'
import { Shield, Save } from 'lucide-react'

const PAGINAS = [
  'dashboard', 'vagas', 'candidatos', 'colaboradores', 'feedbacks',
  'testes', 'agendamentos', 'relatorios', 'configuracoes',
]

const ACOES = ['ver', 'criar', 'editar', 'excluir', 'convidar'] as const

export default function PermissoesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [empresas, setEmpresas] = useState<Pick<Empresa, 'id' | 'nome'>[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [permissoes, setPermissoes] = useState<Permissoes>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [usersRes, empresasRes] = await Promise.all([
        supabase.from('users').select('*').in('role', ['colaborador', 'user_empresa']),
        supabase.from('empresas').select('id, nome'),
      ])
      setUsers(usersRes.data || [])
      setEmpresas(empresasRes.data || [])
    }
    load()
  }, [])

  const filteredUsers = users.filter(u =>
    selectedEmpresa === 'all' || u.empresa_id === selectedEmpresa
  )

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId)
    const user = users.find(u => u.id === userId)
    if (user?.permissoes) {
      setPermissoes(user.permissoes)
    } else {
      const defaultPerms: Permissoes = {}
      PAGINAS.forEach(p => {
        defaultPerms[p] = { ver: true, criar: false, editar: false, excluir: false, convidar: false }
      })
      setPermissoes(defaultPerms)
    }
  }

  const togglePermission = (pagina: string, acao: typeof ACOES[number]) => {
    setPermissoes(prev => ({
      ...prev,
      [pagina]: {
        ...prev[pagina],
        [acao]: !prev[pagina]?.[acao],
      },
    }))
  }

  const handleSave = async () => {
    if (!selectedUser) return
    setSaving(true)
    await supabase.from('users').update({ permissoes }).eq('id', selectedUser)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#00D4FF]" /> Configuracao de Permissoes
        </h1>
        <p className="text-muted-foreground">Defina permissoes granulares por usuario</p>
      </div>

      <div className="flex gap-4">
        <Select value={selectedEmpresa} onValueChange={v => setSelectedEmpresa(v ?? 'all')}>
          <SelectTrigger className="w-64 bg-card border-border"><SelectValue placeholder="Filtrar por empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedUser} onValueChange={v => v && handleSelectUser(v)}>
          <SelectTrigger className="w-64 bg-card border-border"><SelectValue placeholder="Selecionar usuario" /></SelectTrigger>
          <SelectContent>
            {filteredUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.nome_completo} ({u.role})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUser && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Permissoes por Pagina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground">Pagina</th>
                    {ACOES.map(a => (
                      <th key={a} className="text-center py-2 px-3 text-muted-foreground capitalize">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAGINAS.map(pagina => (
                    <tr key={pagina} className="border-b border-border/50">
                      <td className="py-3 pr-4 capitalize text-foreground">{pagina}</td>
                      {ACOES.map(acao => (
                        <td key={acao} className="text-center py-3 px-3">
                          <Switch
                            checked={permissoes[pagina]?.[acao] || false}
                            onCheckedChange={() => togglePermission(pagina, acao)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleSave} className="mt-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar Permissoes'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
