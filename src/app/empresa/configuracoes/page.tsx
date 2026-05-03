'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    setSaving(true); setInviteLink('')
    try {
      const res = await fetch('/api/convites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) })
      const data = await res.json()
      if (res.ok && data.inviteUrl) { setInviteLink(data.inviteUrl); setInviteEmail('') }
    } finally { setSaving(false) }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleGestorSaved = async () => {
    setIsFormGestorOpen(false); setSelectedGestor(null)
    const res = await fetch('/api/empresa/gestores-rh')
    const data = await res.json()
    setGestores(Array.isArray(data) ? data : [])
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/empresa/gestores-rh/${deleteConfirmId}`, { method: 'DELETE' })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Erro ao remover gestor') }
      await handleGestorSaved(); setDeleteConfirmId(null)
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao remover gestor') }
    finally { setDeleting(false) }
  }

  const inputClass = "w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#00D4FF]" /> Configurações da Empresa
      </h1>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a5e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm font-semibold text-white">Equipe de RH</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsFormGestorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all">
              <Plus className="w-3.5 h-3.5" /> Novo Gestor RH
            </button>
            <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setInviteLink('') }}>
              <DialogTrigger render={<button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all" />}>
                <UserPlus className="w-3.5 h-3.5" /> Convidar
              </DialogTrigger>
              <DialogContent className="bg-[#0A0E27] border-[#1e2a5e]">
                <DialogHeader><DialogTitle className="text-white">Convidar para a Equipe</DialogTitle></DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">E-mail</label>
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required placeholder="colaborador@empresa.com" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Função</label>
                    <Select value={inviteRole} onValueChange={v => v && setInviteRole(v)}>
                      <SelectTrigger className="bg-[#111633] border-[#1e2a5e]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gestor_rh">Gestor de RH</SelectItem>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60">
                    {saving ? 'Gerando link...' : 'Gerar Link de Convite'}
                  </button>
                </form>
                {inviteLink && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs text-gray-500">Link de convite (válido por 7 dias):</label>
                    <div className="flex items-center gap-2">
                      <input value={inviteLink} readOnly className={`${inputClass} text-xs font-mono`} />
                      <button type="button" onClick={handleCopy}
                        className="shrink-0 p-2 border border-[#1e2a5e] rounded-lg text-gray-400 hover:text-[#00D4FF] hover:border-[#00D4FF]/40 transition-all">
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              {['Nome', 'E-mail', 'Função', 'Status', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">Carregando...</td></tr>
            ) : gestores.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">Nenhum membro na equipe.</td></tr>
            ) : gestores.map(g => (
              <tr key={g.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5 font-medium text-white">{g.nome_completo}</td>
                <td className="px-4 py-3.5 text-gray-400">{g.email}</td>
                <td className="px-4 py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    {g.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${g.ativo ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'}`}>
                    {g.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => { setSelectedGestor(g); setIsFormGestorOpen(true) }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(g.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormGestorOpen && user?.empresa_id && (
        <FormGestorRH empresaId={user.empresa_id} onClose={() => { setIsFormGestorOpen(false); setSelectedGestor(null) }} onSaved={handleGestorSaved} gestor={selectedGestor || undefined} />
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={open => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-[#0A0E27] border-[#1e2a5e] sm:max-w-[400px]">
          <DialogHeader><DialogTitle className="text-white">Remover Gestor RH</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-400">Tem certeza que deseja remover este gestor? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={deleting}
              className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all disabled:opacity-50">
              Cancelar
            </button>
            <button type="button" onClick={handleDeleteConfirm} disabled={deleting}
              className="px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all disabled:opacity-50">
              {deleting ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
