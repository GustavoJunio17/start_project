'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
        supabase.from('users').select('*').in('role', ['colaborador', 'admin']),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#00D4FF]" /> Configuração de Permissões
          </h1>
          <p className="text-gray-400 text-sm mt-1">Defina permissões granulares por usuário</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={selectedEmpresa} onValueChange={v => setSelectedEmpresa(v ?? 'all')}>
          <SelectTrigger className="w-64 bg-[#111633] border-[#1e2a5e] text-gray-300">
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent className="bg-[#111633] border-[#1e2a5e]">
            <SelectItem value="all" className="text-gray-300">Todas as empresas</SelectItem>
            {empresas.map(e => <SelectItem key={e.id} value={e.id} className="text-gray-300">{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedUser} onValueChange={v => v && handleSelectUser(v)}>
          <SelectTrigger className="w-64 bg-[#111633] border-[#1e2a5e] text-gray-300">
            <SelectValue placeholder="Selecionar usuário" />
          </SelectTrigger>
          <SelectContent className="bg-[#111633] border-[#1e2a5e]">
            {filteredUsers.map(u => (
              <SelectItem key={u.id} value={u.id} className="text-gray-300">{u.nome_completo} ({u.role})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUser && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e2a5e]">
            <p className="text-sm font-semibold text-white">Permissões por Página</p>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a5e]">
                    <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Página</th>
                    {ACOES.map(a => (
                      <th key={a} className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 capitalize">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAGINAS.map(pagina => (
                    <tr key={pagina} className="border-b border-[#1e2a5e]/50 last:border-0">
                      <td className="py-3 pr-4 capitalize text-gray-300">{pagina}</td>
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
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Permissões'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
