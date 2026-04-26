"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/db/client"
import type { Colaborador, StatusColaborador, OrigemColaborador, Empresa, EscolaridadeColaborador } from "@/types/database"

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
    telefone: colaborador?.telefone || '',
    cpf: colaborador?.cpf || '',
    cargo: colaborador?.cargo || '',
    departamento: colaborador?.departamento || '',
    empresa_id: colaborador?.empresa_id || (empresas.length > 0 ? empresas[0].id : ''),
    status: colaborador?.status || 'ativo' as StatusColaborador,
    origem: colaborador?.origem || 'contratacao_direta' as OrigemColaborador,
    data_contratacao: colaborador?.data_contratacao ? colaborador.data_contratacao.split('T')[0] : '',
    modelo_trabalho: colaborador?.modelo_trabalho || '',
    regime_contrato: colaborador?.regime_contrato || '',
    salario: colaborador?.salario ? String(colaborador.salario) : '',
    hard_skills: colaborador?.hard_skills ? colaborador.hard_skills.join(', ') : '',
    escolaridade: colaborador?.escolaridade || '',
  })

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        email: colaborador.email || '',
        telefone: colaborador.telefone || '',
        cpf: colaborador.cpf || '',
        cargo: colaborador.cargo || '',
        departamento: colaborador.departamento || '',
        empresa_id: colaborador.empresa_id,
        status: colaborador.status,
        origem: colaborador.origem,
        data_contratacao: colaborador.data_contratacao ? colaborador.data_contratacao.split('T')[0] : '',
        modelo_trabalho: colaborador.modelo_trabalho || '',
        regime_contrato: colaborador.regime_contrato || '',
        salario: colaborador.salario ? String(colaborador.salario) : '',
        hard_skills: colaborador.hard_skills ? colaborador.hard_skills.join(', ') : '',
        escolaridade: colaborador.escolaridade || '',
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
        telefone: formData.telefone || null,
        cpf: formData.cpf || null,
        cargo: formData.cargo || null,
        departamento: formData.departamento || null,
        empresa_id: formData.empresa_id,
        status: formData.status,
        origem: formData.origem,
        data_contratacao: formData.data_contratacao || null,
        modelo_trabalho: formData.modelo_trabalho || null,
        regime_contrato: formData.regime_contrato || null,
        salario: formData.salario ? parseFloat(formData.salario) : null,
        hard_skills: formData.hard_skills ? formData.hard_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        escolaridade: formData.escolaridade || null,
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto xl:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{colaborador ? 'Editar Colaborador' : 'Adicionar Colaborador'}</DialogTitle>
          <DialogDescription>
            {colaborador ? 'Atualize as informações do colaborador abaixo.' : 'Preencha os dados do novo colaborador na empresa desejada.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações Pessoais e Contato */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Informações Pessoais e Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                <Input
                  value={formData.nome}
                  onChange={e => setFormData(f => ({...f, nome: e.target.value}))}
                  placeholder="Maria Souza"
                  className="bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email Corporativo</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(f => ({...f, email: e.target.value}))}
                  placeholder="maria@empresa.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Telefone/WhatsApp</label>
                <Input
                  value={formData.telefone}
                  onChange={e => setFormData(f => ({...f, telefone: e.target.value}))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">CPF/Documento</label>
                <Input
                  value={formData.cpf}
                  onChange={e => setFormData(f => ({...f, cpf: e.target.value}))}
                  placeholder="000.000.000-00"
                />
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Vínculo Profissional */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Vínculo Profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cargo / Função</label>
                <Input
                  value={formData.cargo}
                  onChange={e => setFormData(f => ({...f, cargo: e.target.value}))}
                  placeholder="Desenvolvedor"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Departamento/Setor</label>
                <Input
                  value={formData.departamento}
                  onChange={e => setFormData(f => ({...f, departamento: e.target.value}))}
                  placeholder="Engenharia, Design, Financeiro"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => val !== null && setFormData(f => ({...f, status: val as StatusColaborador}))}
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

              {empresas.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empresa</label>
                  <Select
                    value={formData.empresa_id}
                    onValueChange={(val) => val !== null && setFormData(f => ({...f, empresa_id: val}))}
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
              )}
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Contrato */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Detalhes do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data de Contratação</label>
                <Input
                  type="date"
                  value={formData.data_contratacao}
                  onChange={e => setFormData(f => ({...f, data_contratacao: e.target.value}))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Modelo de Trabalho</label>
                <Select
                  value={formData.modelo_trabalho}
                  onValueChange={(val) => val !== null && setFormData(f => ({...f, modelo_trabalho: val}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remoto">Remoto</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Regime de Contratação</label>
                <Select
                  value={formData.regime_contrato}
                  onValueChange={(val) => val !== null && setFormData(f => ({...f, regime_contrato: val}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estagio">Estágio</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Salário / Remuneração</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salario}
                  onChange={e => setFormData(f => ({...f, salario: e.target.value}))}
                  placeholder="0.00"
                />
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Técnicas */}
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm">Informações Técnicas</CardTitle>
              <CardDescription>Opcional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Hard Skills (Tecnologias)</label>
                <Textarea
                  value={formData.hard_skills}
                  onChange={e => setFormData(f => ({...f, hard_skills: e.target.value}))}
                  placeholder="Ex: React, Node.js, TypeScript (separe por vírgula)"
                  className="min-h-[80px] bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Escolaridade</label>
                <Select
                  value={formData.escolaridade}
                  onValueChange={(val) => val !== null && setFormData(f => ({...f, escolaridade: val as EscolaridadeColaborador}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medio">Médio</SelectItem>
                    <SelectItem value="Superior">Superior</SelectItem>
                    <SelectItem value="Pos-graduado">Pós-graduado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
