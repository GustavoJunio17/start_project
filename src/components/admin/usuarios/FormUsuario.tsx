"use client"

import { useState, useEffect } from "react"

import { createClient } from "@/lib/db/client"
import { useAuth } from "@/hooks/useAuth"
import type { User, Role } from "@/types/database"
import { validatePassword } from "@/lib/utils/masks"
import { PasswordStrength } from "@/components/ui/PasswordStrength"

interface FormUsuarioProps {
  user: User | null
  mode?: 'convidar' | 'criar'
  onClose: () => void
  onSaved: () => void
}

interface Empresa {
  id: string
  nome: string
}

const ROLE_LABELS: Record<string, string> = {
  'super_admin': 'Super Admin',
  'super_gestor': 'Super Gestor',
  'admin': 'Admin (Empresa)',
  'gestor_rh': 'Gestor RH',
}

export function FormUsuario({ user, mode = 'convidar', onClose, onSaved }: FormUsuarioProps) {
  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const supabase = createClient()
  const { user: currentUser } = useAuth()
  const isSuperGestor = currentUser?.role === 'super_gestor'

  const [formData, setFormData] = useState({
    nome_completo: user?.nome_completo || '',
    email: user?.email || '',
    role: user?.role || 'gestor_rh' as Role,
    empresa_id: (user?.empresa_id || '') as string,
    senha: '',
  })

  useEffect(() => {
    // Carregar empresas
    const fetchEmpresas = async () => {
      try {
        const res = await fetch('/api/admin/empresas-list')
        if (res.ok) {
          const data = await res.json()
          // Garante que é um array
          const empresasArray = Array.isArray(data) ? data : data.data || data.empresas || []
          setEmpresas(empresasArray)
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
      }
    }

    fetchEmpresas()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        nome_completo: user.nome_completo,
        email: user.email,
        role: user.role,
        empresa_id: user.empresa_id || '',
        senha: '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.senha) {
      const { valid } = validatePassword(formData.senha)
      if (!valid) {
        alert('A senha não atende aos requisitos: mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número')
        return
      }
    } else if (mode === 'criar') {
      alert('Senha é obrigatória')
      return
    }

    setLoading(true)

    try {
      if (user) {
        // Usa a API para atualizar, pois a atualização de senha precisa de hash com bcrypt
        const res = await fetch(`/api/admin/usuarios/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome_completo: formData.nome_completo,
            role: formData.role,
            ...(formData.empresa_id && (formData.role === 'admin' || formData.role === 'gestor_rh') ? { empresa_id: formData.empresa_id } : {}),
            ...(formData.senha ? { password: formData.senha } : {})
          })
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Erro ao atualizar usuário')
        }
      } else {
        // Add new user (simulated standard behavior)
        const { error } = await supabase
          .from('users')
          .insert({
            nome_completo: formData.nome_completo,
            email: formData.email,
            role: formData.role,
            tema_preferido: 'auto',
            ativo: true
          })
          
        if (error) throw error
      }
      onSaved()
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-md my-8 relative flex flex-col animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#0A0E27] transition-colors"
          >
            ✕
          </button>
          
          <div className="px-6 pt-6 pb-4 border-b border-[#1e2a5e]">
            <h2 className="text-xl font-bold text-white">
              {user ? 'Editar Usuário' : mode === 'criar' ? 'Criar Novo Usuário' : 'Convidar Novo Usuário'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {user ? 'Atualize as informações do usuário abaixo.' : mode === 'criar' ? 'Preencha os dados do novo usuário.' : 'Preencha os dados do novo usuário para enviar um convite.'}
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                <input 
                  type="text"
                  value={formData.nome_completo} 
                  onChange={e => setFormData(f => ({...f, nome_completo: e.target.value}))} 
                  placeholder="João da Silva"
                  required
                  className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData(f => ({...f, email: e.target.value}))} 
                  placeholder="joao@empresa.com"
                  disabled={!!user}
                  required
                  className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {!!user && <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado diretamente.</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nível de Acesso (Role)</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(f => ({...f, role: e.target.value as Role}))}
                    className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                  >
                    {!isSuperGestor && <option value="super_admin" className="bg-[#111633]">Super Admin</option>}
                    {!isSuperGestor && <option value="super_gestor" className="bg-[#111633]">Super Gestor</option>}
                    <option value="admin" className="bg-[#111633]">Admin (Empresa)</option>
                    <option value="gestor_rh" className="bg-[#111633]">Gestor RH</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {(formData.role === 'admin' || formData.role === 'gestor_rh') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Empresa *</label>
                  <div className="relative">
                    <select
                      value={formData.empresa_id}
                      onChange={(e) => setFormData(f => ({...f, empresa_id: e.target.value}))}
                      className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#111633] text-gray-500">Selecione uma empresa</option>
                      {Array.isArray(empresas) && empresas.map(emp => (
                        <option key={emp.id} value={emp.id} className="bg-[#111633]">{emp.nome}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              )}

              {(mode === 'criar' || user) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{mode === 'criar' ? 'Senha *' : 'Nova Senha (Opcional)'}</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={e => setFormData(f => ({...f, senha: e.target.value}))}
                    placeholder={mode === 'criar' ? 'Mínimo 8 caracteres' : 'Deixe em branco para manter a atual'}
                    required={mode === 'criar'}
                    minLength={8}
                    className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                  />
                  <PasswordStrength password={formData.senha} />
                </div>
              )}

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-[#1e2a5e] mt-6">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#0A0E27] transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading || ((formData.role === 'admin' || formData.role === 'gestor_rh') && !formData.empresa_id) || (mode === 'criar' && !formData.senha)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Salvando...' : user ? 'Atualizar' : mode === 'criar' ? 'Criar' : 'Convidar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
