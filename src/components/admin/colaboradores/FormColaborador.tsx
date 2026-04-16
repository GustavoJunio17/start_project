"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/db/client"
import type { Colaborador, StatusColaborador, OrigemColaborador, Empresa } from "@/types/database"

interface FormColaboradorProps {
  colaborador: Colaborador | null
  empresas: Pick<Empresa, 'id' | 'nome'>[]
  onClose: () => void
  onSaved: () => void
}

export function FormColaborador({ colaborador, empresas, onClose, onSaved }: FormColaboradorProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    nome: colaborador?.nome || '',
    email: colaborador?.email || '',
    cargo: colaborador?.cargo || '',
    empresa_id: colaborador?.empresa_id || (empresas.length > 0 ? empresas[0].id : ''),
    status: colaborador?.status || 'ativo' as StatusColaborador,
    origem: colaborador?.origem || 'contratacao_direta' as OrigemColaborador,
    data_contratacao: colaborador?.data_contratacao ? colaborador.data_contratacao.split('T')[0] : ''
  })

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        email: colaborador.email || '',
        cargo: colaborador.cargo || '',
        empresa_id: colaborador.empresa_id,
        status: colaborador.status,
        origem: colaborador.origem,
        data_contratacao: colaborador.data_contratacao ? colaborador.data_contratacao.split('T')[0] : ''
      })
    }
  }, [colaborador])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email || null,
        cargo: formData.cargo || null,
        empresa_id: formData.empresa_id,
        status: formData.status,
        origem: formData.origem,
        data_contratacao: formData.data_contratacao || null,
      }

      if (colaborador) {
        const { error } = await supabase
          .from('colaboradores')
          .update(payload)
          .eq('id', colaborador.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('colaboradores')
          .insert([payload])
          
        if (error) throw error
      }
      onSaved()
    } catch (error: any) {
      alert('Erro ao salvar colaborador: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] xl:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{colaborador ? 'Editar Colaborador' : 'Adicionar Colaborador'}</DialogTitle>
          <DialogDescription>
            {colaborador ? 'Atualize as informações do colaborador abaixo.' : 'Preencha os dados do novo colaborador na empresa desejada.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input 
                value={formData.nome} 
                onChange={e => setFormData(f => ({...f, nome: e.target.value}))} 
                placeholder="Maria Souza"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={e => setFormData(f => ({...f, email: e.target.value}))} 
                placeholder="maria@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo / Função</label>
              <Input 
                value={formData.cargo} 
                onChange={e => setFormData(f => ({...f, cargo: e.target.value}))} 
                placeholder="Vendedor"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Select 
                value={formData.empresa_id} 
                onValueChange={(val) => setFormData(f => ({...f, empresa_id: val}))}
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
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(val: StatusColaborador) => setFormData(f => ({...f, status: val}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em_treinamento">Em Treinamento</SelectItem>
                  <SelectItem value="desligado">Desligado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Contratação</label>
              <Input 
                type="date"
                value={formData.data_contratacao} 
                onChange={e => setFormData(f => ({...f, data_contratacao: e.target.value}))} 
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.empresa_id}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
