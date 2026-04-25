"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/db/client"
import { useAuth } from "@/hooks/useAuth"
import type { Vaga, StatusVaga, Empresa } from "@/types/database"

interface FormVagaProps {
  vaga: Vaga | null
  empresas: Pick<Empresa, 'id' | 'nome'>[]
  onClose: () => void
  onSaved: () => void
}

export function FormVaga({ vaga, empresas, onClose, onSaved }: FormVagaProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    titulo: vaga?.titulo || '',
    empresa_id: vaga?.empresa_id || (empresas.length > 0 ? empresas[0].id : ''),
    descricao: vaga?.descricao || '',
    requisitos: vaga?.requisitos || '',
    categoria: vaga?.categoria || '',
    status: vaga?.status || 'rascunho' as StatusVaga,
  })

  useEffect(() => {
    if (vaga) {
      setFormData({
        titulo: vaga.titulo,
        empresa_id: vaga.empresa_id,
        descricao: vaga.descricao || '',
        requisitos: vaga.requisitos || '',
        categoria: vaga.categoria || '',
        status: vaga.status,
      })
    }
  }, [vaga])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        titulo: formData.titulo,
        empresa_id: formData.empresa_id,
        descricao: formData.descricao || null,
        requisitos: formData.requisitos || null,
        categoria: formData.categoria || null,
        status: formData.status,
      }

      if (vaga) {
        const { error } = await supabase
          .from('vagas')
          .update(payload)
          .eq('id', vaga.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vagas')
          .insert([{ ...payload, criado_por: user?.id }])
          
        if (error) throw error
      }
      onSaved()
    } catch (error: any) {
      alert('Erro ao salvar vaga: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] xl:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vaga ? 'Editar Vaga' : 'Criar Nova Vaga'}</DialogTitle>
          <DialogDescription>
            {vaga ? 'Atualize as informações da vaga abaixo.' : 'Preencha os dados para criar uma vaga para uma empresa do sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Título da Vaga *</label>
              <Input 
                value={formData.titulo} 
                onChange={e => setFormData(f => ({...f, titulo: e.target.value}))} 
                placeholder="Ex: Desenvolvedor Front-end Pleno"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa *</label>
              <Select 
                value={formData.empresa_id} 
                onValueChange={(val) => val !== null && setFormData(f => ({...f, empresa_id: val}))}
                required
              >
                <SelectTrigger>
                  <span className="truncate">
                    {empresas.find(e => e.id === formData.empresa_id)?.nome || 'Selecione uma empresa'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Input 
                value={formData.categoria} 
                onChange={e => setFormData(f => ({...f, categoria: e.target.value}))} 
                placeholder="Ex: Tecnologia, Vendas"
              />
            </div>

            {vaga?.status !== 'rascunho' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => val !== null && setFormData(f => ({...f, status: val as StatusVaga}))}
                >
                  <SelectTrigger>
                    <span className="truncate">
                      {formData.status === 'aberta' ? 'Aberta' : formData.status === 'pausada' ? 'Pausada' : 'Encerrada'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberta">Aberta</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="encerrada">Encerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea 
                value={formData.descricao} 
                onChange={e => setFormData(f => ({...f, descricao: e.target.value}))} 
                placeholder="Descreva as responsabilidades, atividades e detalhes da vaga..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Requisitos</label>
              <Textarea 
                value={formData.requisitos} 
                onChange={e => setFormData(f => ({...f, requisitos: e.target.value}))} 
                placeholder="Descreva os requisitos técnicos, comportamentais e desejáveis..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.empresa_id || !formData.titulo}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
