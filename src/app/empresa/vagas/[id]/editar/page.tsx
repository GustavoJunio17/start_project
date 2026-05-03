'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { useCargosEDepartamentos } from '@/hooks/useCargosEDepartamentos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { formatBRDateInput, formatDateToISO, formatDateToBR } from '@/lib/utils/date'
import { formatBRL, centsToFloat, floatToCents } from '@/lib/utils/currency'
import type { TemplateTeste } from '@/types/database'

export default function EditarVagaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const vagaId = params.id as string
  const { cargos, departamentos, loading: cargosDeptLoading } = useCargosEDepartamentos(user?.empresa_id, user?.role, user?.id)

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<TemplateTeste[]>([])
  const [form, setForm] = useState({
    titulo: '',
    cargo: '',
    descricao: '',
    requisitos: '',
    categoria: '',
    modelo_trabalho: '',
    regime: '',
    salario: '',
    hard_skills: '',
    idiomas: '',
    escolaridade_minima: '',
    departamento: '',
    data_limite: '',
    quantidade_vagas: '1',
    beneficios: '',
    diferenciais: '',
    template_testes_id: '',
  })
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    const loadTemplates = async () => {
      const { data } = await supabase
        .from('templates_testes')
        .select('*')
        .eq('empresa_id', user.empresa_id)
      setTemplates(data || [])
    }
    loadTemplates()
  }, [user?.empresa_id])

  useEffect(() => {
    const loadVaga = async () => {
      const { data } = await supabase
        .from('vagas')
        .select('*')
        .eq('id', vagaId)
        .single()

      if (data) {
        setForm({
          titulo: data.titulo || '',
          cargo: data.cargo || '',
          descricao: data.descricao || '',
          requisitos: data.requisitos || '',
          categoria: data.categoria || '',
          modelo_trabalho: data.modelo_trabalho || '',
          regime: data.regime || '',
          salario: floatToCents(data.salario),
          hard_skills: Array.isArray(data.hard_skills) ? data.hard_skills.join(', ') : '',
          idiomas: Array.isArray(data.idiomas) ? data.idiomas.map((i: any) => `${i.idioma}: ${i.nivel}`).join('; ') : '',
          escolaridade_minima: data.escolaridade_minima || '',
          departamento: data.departamento || '',
          data_limite: data.data_limite ? formatDateToBR(data.data_limite) : '',
          quantidade_vagas: String(data.quantidade_vagas || 1),
          beneficios: Array.isArray(data.beneficios) ? data.beneficios.join(', ') : '',
          diferenciais: data.diferenciais || '',
          template_testes_id: data.template_testes_id || '',
        })
      }
      setLoading(false)
    }

    loadVaga()
  }, [vagaId])

  const selectedDepartamentoId = departamentos.find(d => d.nome === form.departamento)?.id ?? ''
  const filteredCargos = selectedDepartamentoId
    ? cargos.filter(c => c.departamento_id === selectedDepartamentoId)
    : cargos

  const handleDepartamentoChange = (val: string | null) => {
    if (!val) return
    setForm(f => ({ ...f, departamento: val, cargo: '' }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setSaving(true)
    try {
      // Parse idiomas com segurança
      const idiomas = form.idiomas ?
        form.idiomas.split(';')
          .map(i => {
            const parts = i.split(':')
            return {
              idioma: parts[0]?.trim() || '',
              nivel: parts[1]?.trim() || ''
            }
          })
          .filter(i => i.idioma && i.nivel)
        : null

      // Parse hard_skills com segurança
      const hard_skills = form.hard_skills ?
        form.hard_skills.split(',')
          .map(s => s.trim())
          .filter(Boolean)
        : null

      // Parse beneficios com segurança
      const beneficios = form.beneficios ?
        form.beneficios.split(',')
          .map(b => b.trim())
          .filter(Boolean)
        : null

      const { error } = await supabase
        .from('vagas')
        .update({
          titulo: form.titulo.trim(),
          cargo: form.cargo?.trim() || null,
          descricao: form.descricao?.trim() || null,
          requisitos: form.requisitos?.trim() || null,
          categoria: form.categoria?.trim() || null,
          template_testes_id: form.template_testes_id || null,
          modelo_trabalho: form.modelo_trabalho || null,
          regime: form.regime || null,
          salario: centsToFloat(form.salario),
          hard_skills: hard_skills,
          idiomas: idiomas,
          escolaridade_minima: form.escolaridade_minima || null,
          departamento: form.departamento?.trim() || null,
          data_limite: form.data_limite ? formatDateToISO(form.data_limite) : null,
          quantidade_vagas: form.quantidade_vagas ? parseInt(form.quantidade_vagas) : 1,
          beneficios: beneficios,
          diferenciais: form.diferenciais?.trim() || null,
        })
        .eq('id', vagaId)

      if (error) throw error

      toast.success('Vaga atualizada com sucesso!')
      router.push('/empresa/vagas')
    } catch (error: any) {
      toast.error('Erro ao salvar vaga: ' + error.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Vaga</h1>
            <p className="text-muted-foreground">Atualize os detalhes da vaga</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid gap-6">
            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e2a5e]">
                <p className="font-semibold text-white">Informações Principais</p>
                <p className="text-sm text-gray-400 mt-1">Detalhes básicos da vaga</p>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título da Vaga *</Label>
                    <Input
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      required
                      className="bg-background"
                      placeholder="Ex: Desenvolvedor Front-end Pleno (Sistemas de Infraestrutura)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo
                      {!cargosDeptLoading && filteredCargos.length === 0 && (
                        <span className="text-orange-400 text-xs ml-1">
                          {cargos.length === 0 ? '(nenhum cadastrado)' : '(selecione um departamento)'}
                        </span>
                      )}
                    </Label>
                    {cargosDeptLoading ? (
                      <div className="h-10 bg-background rounded border border-border animate-pulse" />
                    ) : filteredCargos.length > 0 ? (
                      <Select
                        value={form.cargo}
                        onValueChange={(val) => val !== null && setForm({ ...form, cargo: val })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCargos.map(cargo => (
                            <SelectItem key={cargo.id} value={cargo.nome}>{cargo.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={form.cargo}
                        onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                        className="bg-background"
                        placeholder="Ex: Desenvolvedor, Engenheiro"
                        disabled={!!selectedDepartamentoId && cargos.length > 0}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição da Vaga</Label>
                  <Textarea
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    className="bg-background min-h-[120px]"
                    placeholder="Descreva as responsabilidades e o dia a dia da vaga..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Requisitos</Label>
                  <Textarea
                    value={form.requisitos}
                    onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                    className="bg-background min-h-[100px]"
                    placeholder="Liste as habilidades, qualificações e experiências necessárias..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e2a5e]">
                <p className="font-semibold text-white">Teste Aplicado</p>
                <p className="text-sm text-gray-400 mt-1">Selecione qual template de testes será aplicado aos candidatos desta vaga (opcional)</p>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  <Label>Template de Testes</Label>
                  <select
                    value={form.template_testes_id}
                    onChange={e => setForm({ ...form, template_testes_id: e.target.value })}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Nenhum (sem teste)</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                  {form.template_testes_id && templates.find(t => t.id === form.template_testes_id)?.descricao && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {templates.find(t => t.id === form.template_testes_id)?.descricao}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e2a5e]">
                <p className="font-semibold text-white">Informações de Contrato</p>
                <p className="text-sm text-gray-400 mt-1">Detalhes sobre o tipo de contrato e compensação</p>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Modelo de Trabalho</Label>
                    <select
                      value={form.modelo_trabalho}
                      onChange={e => setForm({ ...form, modelo_trabalho: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">Selecione</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                      <option value="presencial">Presencial</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Regime</Label>
                    <select
                      value={form.regime}
                      onChange={e => setForm({ ...form, regime: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">Selecione</option>
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Estagio">Estágio</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade de Vagas</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.quantidade_vagas}
                      onChange={e => setForm({ ...form, quantidade_vagas: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salário</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatBRL(form.salario)}
                      onChange={e => setForm({ ...form, salario: e.target.value.replace(/\D/g, '') })}
                      className="bg-background"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data Limite para Candidaturas</Label>
                  <Input
                    type="text"
                    value={form.data_limite}
                    onChange={e => setForm({ ...form, data_limite: formatBRDateInput(e.target.value) })}
                    className="bg-background"
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Departamento/Setor
                    {!cargosDeptLoading && departamentos.length === 0 && (
                      <span className="text-orange-400 text-xs ml-1">(nenhum cadastrado)</span>
                    )}
                  </Label>
                  {cargosDeptLoading ? (
                    <div className="h-10 bg-background rounded border border-border animate-pulse" />
                  ) : departamentos.length > 0 ? (
                    <Select
                      value={form.departamento}
                      onValueChange={handleDepartamentoChange}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione um departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departamentos.map(dept => (
                          <SelectItem key={dept.id} value={dept.nome}>{dept.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={form.departamento}
                      onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                      className="bg-background"
                      placeholder="Ex: Engenharia, Comercial, RH"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e2a5e]">
                <p className="font-semibold text-white">Especificações Técnicas</p>
                <p className="text-sm text-gray-400 mt-1">Habilidades, idiomas e requisitos educacionais</p>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  <Label>Hard Skills (Tecnologias)</Label>
                  <Textarea
                    value={form.hard_skills}
                    onChange={e => setForm({ ...form, hard_skills: e.target.value })}
                    className="bg-background min-h-[80px]"
                    placeholder="Separe por vírgula. Ex: C#, React, SQL, Node.js"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Idiomas</Label>
                  <Textarea
                    value={form.idiomas}
                    onChange={e => setForm({ ...form, idiomas: e.target.value })}
                    className="bg-background min-h-[80px]"
                    placeholder="Separe por ponto e vírgula. Ex: Inglês: Avançado; Espanhol: Intermediário"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Escolaridade Mínima</Label>
                  <select
                    value={form.escolaridade_minima}
                    onChange={e => setForm({ ...form, escolaridade_minima: e.target.value })}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Selecione</option>
                    <option value="EnsinioMedio">Ensino Médio</option>
                    <option value="Superior">Ensino Superior</option>
                    <option value="Pos">Pós-graduação</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e2a5e]">
                <p className="font-semibold text-white">Diferenciais e Benefícios</p>
                <p className="text-sm text-gray-400 mt-1">O que você oferece e pontos diferenciais</p>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  <Label>Benefícios</Label>
                  <Textarea
                    value={form.beneficios}
                    onChange={e => setForm({ ...form, beneficios: e.target.value })}
                    className="bg-background min-h-[80px]"
                    placeholder="Separe por vírgula. Ex: VR, VA, Plano de Saúde, Gympass, Home Office"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Diferenciais</Label>
                  <Textarea
                    value={form.diferenciais}
                    onChange={e => setForm({ ...form, diferenciais: e.target.value })}
                    className="bg-background min-h-[100px]"
                    placeholder="O que não é obrigatório, mas soma pontos..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] gap-2" disabled={saving}>
                {saving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar</>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
