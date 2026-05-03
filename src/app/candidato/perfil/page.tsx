'use client'

import { useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tema } from '@/types/database'
import { Save, User } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    await supabase.from('users').update({ nome_completo: nome, telefone, tema_preferido: tema }).eq('id', user.id)
    setSaving(false)
    setMessage('Perfil atualizado com sucesso!')
    refetch()
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePasswordChange = async () => {
    const newPassword = prompt('Nova senha (mínimo 6 caracteres):')
    if (!newPassword || newPassword.length < 6) {
      setMessage('Senha deve ter no mínimo 6 caracteres')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }), credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json()
      setMessage('Erro ao alterar senha: ' + data.error)
    } else {
      setMessage('Senha alterada com sucesso!')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-all placeholder:text-gray-700"

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-[#00D4FF]" /> Meu Perfil
        </h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie suas informações pessoais e preferências.</p>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        {/* Subtle accent gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
          Dados da Conta
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Nome Completo</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className={inputClass} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">E-mail <span className="text-[10px] text-gray-500 font-normal ml-1">(Não pode ser alterado)</span></label>
              <input value={user?.email || ''} disabled className={`${inputClass} opacity-40 cursor-not-allowed`} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">WhatsApp</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Tema da Interface</label>
              <Select value={tema} onValueChange={v => setTema(v as Tema)}>
                <SelectTrigger className="w-full h-11 bg-white/[0.03] border-white/[0.08] rounded-xl text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0E27] border-white/[0.1]">
                  <SelectItem value="dark">Dark Mode (Padrão)</SelectItem>
                  <SelectItem value="clean">Light Mode</SelectItem>
                  <SelectItem value="auto">Automático (Sistema)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary min-w-[140px] h-12"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4" /> Salvar Alterações</>
              )}
            </button>
            <button 
              type="button" 
              onClick={handlePasswordChange}
              className="btn-ghost h-12"
            >
              Alterar Minha Senha
            </button>
          </div>

          {message && (
            <div className={cn(
              "p-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-left-2",
              message.includes('Erro') ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            )}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
