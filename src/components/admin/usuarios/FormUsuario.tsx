"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/db/client"
import type { User, Role } from "@/types/database"

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
  'user_empresa': 'Admin (Empresa)',
  'gestor_rh': 'Gestor RH',
}

export function FormUsuario({ user, mode = 'convidar', onClose, onSaved }: FormUsuarioProps) {
  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const supabase = createClient()

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
            ...(formData.empresa_id && (formData.role === 'user_empresa' || formData.role === 'gestor_rh') ? { empresa_id: formData.empresa_id } : {}),
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : mode === 'criar' ? 'Criar Novo Usuário' : 'Convidar Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Atualize as informações do usuário abaixo.' : mode === 'criar' ? 'Preencha os dados do novo usuário.' : 'Preencha os dados do novo usuário para enviar um convite.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome Completo</label>
            <Input 
              value={formData.nome_completo} 
              onChange={e => setFormData(f => ({...f, nome_completo: e.target.value}))} 
              placeholder="João da Silva"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={e => setFormData(f => ({...f, email: e.target.value}))} 
              placeholder="joao@empresa.com"
              disabled={!!user} // Email usually doesn't change directly
              required
            />
            {!!user && <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado diretamente.</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Nível de Acesso (Role)</label>
            <Select
              value={formData.role}
              onValueChange={(val) => val !== null && setFormData(f => ({...f, role: val as Role}))}
            >
              <SelectTrigger>
                <span className="truncate">
                  {ROLE_LABELS[formData.role] || 'Selecione um nível'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="super_gestor">Super Gestor</SelectItem>
                <SelectItem value="user_empresa">Admin (Empresa)</SelectItem>
                <SelectItem value="gestor_rh">Gestor RH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'user_empresa' || formData.role === 'gestor_rh') && (
            <div>
              <label className="text-sm font-medium">Empresa *</label>
              <Select
                value={formData.empresa_id}
                onValueChange={(val) => setFormData(f => ({...f, empresa_id: val as string}))}
              >
                <SelectTrigger>
                  <span className="truncate">
                    {Array.isArray(empresas) && empresas.find(e => e.id === formData.empresa_id)?.nome || 'Selecione uma empresa'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(empresas) && empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(mode === 'criar' || user) && (
            <div>
              <label className="text-sm font-medium">{mode === 'criar' ? 'Senha *' : 'Nova Senha (Opcional)'}</label>
              <Input
                type="password"
                value={formData.senha}
                onChange={e => setFormData(f => ({...f, senha: e.target.value}))}
                placeholder={mode === 'criar' ? 'Mínimo 6 caracteres' : 'Deixe em branco para manter a atual'}
                required={mode === 'criar'}
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || ((formData.role === 'user_empresa' || formData.role === 'gestor_rh') && !formData.empresa_id) || (mode === 'criar' && !formData.senha)}
            >
              {loading ? 'Salvando...' : user ? 'Atualizar' : mode === 'criar' ? 'Criar' : 'Convidar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
