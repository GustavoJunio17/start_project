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
  onClose: () => void
  onSaved: () => void
}

export function FormUsuario({ user, onClose, onSaved }: FormUsuarioProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    nome_completo: user?.nome_completo || '',
    email: user?.email || '',
    role: user?.role || 'colaborador' as Role,
    senha: '', // Nova senha
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nome_completo: user.nome_completo,
        email: user.email,
        role: user.role,
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
          <DialogTitle>{user ? 'Editar Usuário' : 'Convidar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {user ? 'Atualize as informações do usuário abaixo.' : 'Preencha os dados do novo usuário para enviar um convite.'}
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
              onValueChange={(val: Role) => setFormData(f => ({...f, role: val}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="gestor_rh">Gestor RH</SelectItem>
                <SelectItem value="colaborador">Colaborador</SelectItem>
                <SelectItem value="candidato">Candidato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {user && (
            <div>
              <label className="text-sm font-medium">Nova Senha (Opcional)</label>
              <Input 
                type="password"
                value={formData.senha} 
                onChange={e => setFormData(f => ({...f, senha: e.target.value}))} 
                placeholder="Deixe em branco para manter a atual"
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
