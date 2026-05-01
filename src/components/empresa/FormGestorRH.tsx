'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useCargosEDepartamentos } from '@/hooks/useCargosEDepartamentos'
import { AlertCircle } from 'lucide-react'

import type { User } from '@/types/database'

interface FormGestorRHProps {
  empresaId: string
  onClose: () => void
  onSaved: () => void
  gestor?: User & { setores?: Array<{ id: string }> }
}

export function FormGestorRH({ empresaId, onClose, onSaved, gestor }: FormGestorRHProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { departamentos, loading: deptLoading } = useCargosEDepartamentos(empresaId)
  const isEditing = !!gestor

  const [formData, setFormData] = useState({
    nome_completo: gestor?.nome_completo || '',
    email: gestor?.email || '',
    telefone: gestor?.telefone || '',
    senha: '',
    departamentos: (gestor?.setores?.map(s => s.id) || []) as string[],
  })

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Senha deve ter no mínimo 8 caracteres'
    if (!/[A-Z]/.test(pass)) return 'Senha deve ter pelo menos uma letra maiúscula'
    if (!/[a-z]/.test(pass)) return 'Senha deve ter pelo menos uma letra minúscula'
    if (!/[0-9]/.test(pass)) return 'Senha deve ter pelo menos um número'
    return null
  }

  const handleCheckboxChange = (deptId: string) => {
    setFormData(f => ({
      ...f,
      departamentos: f.departamentos.includes(deptId)
        ? f.departamentos.filter(id => id !== deptId)
        : [...f.departamentos, deptId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.nome_completo || !formData.email || formData.departamentos.length === 0) {
      setError('Preencha nome, email e selecione pelo menos um setor')
      return
    }

    if (isEditing) {
      if (formData.senha) {
        const passwordError = validatePassword(formData.senha)
        if (passwordError) {
          setError(passwordError)
          return
        }
      }
    } else {
      if (!formData.senha) {
        setError('Senha obrigatória')
        return
      }
      const passwordError = validatePassword(formData.senha)
      if (passwordError) {
        setError(passwordError)
        return
      }
    }

    setLoading(true)

    try {
      const method = isEditing ? 'PUT' : 'POST'
      const body = {
        ...(isEditing && { id: gestor!.id }),
        nome_completo: formData.nome_completo,
        email: formData.email,
        telefone: formData.telefone || null,
        ...(formData.senha && { senha: formData.senha }),
        departamentos: formData.departamentos,
      }

      const res = await fetch('/api/empresa/gestores-rh', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} gestor RH`)
      }

      onSaved()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(`Erro desconhecido ao ${isEditing ? 'atualizar' : 'criar'} gestor RH`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEditing ? 'Editar Gestor RH' : 'Adicionar Gestor RH'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do gestor de RH e os setores que ele poderá gerenciar.'
              : 'Crie um novo gestor de RH e atribua os setores que ele poderá gerenciar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Informações Pessoais */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                <Input
                  value={formData.nome_completo}
                  onChange={e => setFormData(f => ({ ...f, nome_completo: e.target.value }))}
                  placeholder="João Silva"
                  className="bg-card"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email Corporativo</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  placeholder="joao@empresa.com"
                  className="bg-card"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Telefone/WhatsApp</label>
                <Input
                  value={formData.telefone}
                  onChange={e => setFormData(f => ({ ...f, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Senha {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="password"
                  value={formData.senha}
                  onChange={e => setFormData(f => ({ ...f, senha: e.target.value }))}
                  placeholder={isEditing ? 'Deixe em branco para manter a senha atual' : 'Mínimo 8 caracteres'}
                  className="bg-card"
                  required={!isEditing}
                />
                {formData.senha && !validatePassword(formData.senha) ? (
                  <p className="text-xs text-green-500">✓ Senha válida</p>
                ) : formData.senha ? (
                  <div className="flex items-start gap-2 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <ul className="text-xs text-blue-500 space-y-0.5 list-disc list-inside">
                      <li>Mínimo 8 caracteres</li>
                      <li>Pelo menos uma letra maiúscula</li>
                      <li>Pelo menos uma letra minúscula</li>
                      <li>Pelo menos um número</li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Setores */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Setores que pode gerenciar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[168px] overflow-y-auto space-y-3 p-6 pt-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {deptLoading ? (
                <div className="text-sm text-muted-foreground">Carregando setores...</div>
              ) : departamentos.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhum setor cadastrado na empresa</div>
              ) : (
                departamentos.map(dept => (
                  <div key={dept.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`dept-${dept.id}`}
                      checked={formData.departamentos.includes(dept.id)}
                      onCheckedChange={() => handleCheckboxChange(dept.id)}
                      className="mt-1"
                    />
                    <label htmlFor={`dept-${dept.id}`} className="flex-1 text-sm cursor-pointer">
                      <div className="font-medium text-foreground">{dept.nome}</div>
                      {dept.descricao && <div className="text-xs text-muted-foreground">{dept.descricao}</div>}
                    </label>
                  </div>
                ))
              )}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

        </form>

        <DialogFooter className="shrink-0 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} onClick={handleSubmit}>
            {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Gestor RH')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
