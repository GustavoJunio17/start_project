'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { formatBRDateInput, formatDateToISO } from '@/lib/utils/date'
import type { TemplateTeste } from '@/types/database'

export default function NovaVagaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<TemplateTeste[]>([])
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    requisitos: '',
    categoria: '',
    perfil_disc_D: 1,
    perfil_disc_I: 1,
    perfil_disc_S: 1,
    perfil_disc_C: 1,
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 Formulário submetido')
    console.log('👤 User:', user)
    console.log('📋 Form:', form)

    if (!user?.empresa_id) {
      console.error('❌ Usuário não associado a empresa')
      toast.error('Usuário não está associado a uma empresa')
      return
    }

    setSaving(true)
    try {
      console.log('📤 Enviando para Supabase...')
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
        : []

      // Parse hard_skills com segurança
      const hard_skills = form.hard_skills ?
        form.hard_skills.split(',')
          .map(s => s.trim())
          .filter(Boolean)
        : []

      // Parse beneficios com segurança
      const beneficios = form.beneficios ?
        form.beneficios.split(',')
          .map(b => b.trim())
          .filter(Boolean)
        : []

      // Validar e sanitizar payload
      const payload = {
        empresa_id: user.empresa_id,
        titulo: form.titulo.trim(),
        descricao: form.descricao?.trim() || null,
        requisitos: form.requisitos?.trim() || null,
        categoria: form.categoria?.trim() || null,
        perfil_disc_ideal: {
          D: Math.max(1, Math.min(10, Number(form.perfil_disc_D) || 1)),
          I: Math.max(1, Math.min(10, Number(form.perfil_disc_I) || 1)),
          S: Math.max(1, Math.min(10, Number(form.perfil_disc_S) || 1)),
          C: Math.max(1, Math.min(10, Number(form.perfil_disc_C) || 1))
        },
        template_testes_id: form.template_testes_id || null,
        modelo_trabalho: form.modelo_trabalho || null,
        regime: form.regime || null,
        salario: form.salario ? parseFloat(form.salario) : null,
        hard_skills: hard_skills.length > 0 ? hard_skills : null,
        idiomas: idiomas.length > 0 ? idiomas : null,
        escolaridade_minima: form.escolaridade_minima || null,
        departamento: form.departamento?.trim() || null,
        data_limite: form.data_limite ? formatDateToISO(form.data_limite) : null,
        quantidade_vagas: form.quantidade_vagas ? parseInt(form.quantidade_vagas) : 1,
        beneficios: beneficios.length > 0 ? beneficios : null,
        diferenciais: form.diferenciais?.trim() || null,
        criado_por: user.id,
        status: 'rascunho'
      }

      console.log('📦 Payload sanitizado:', JSON.stringify(payload, null, 2))

      const { error } = await supabase.from('vagas').insert(payload)

      if (error) {
        console.error('❌ Erro Supabase:', error)
        throw error
      }

      console.log('✅ Vaga criada com sucesso!')
      toast.success('Vaga criada com sucesso!')

      // Limpar formulário
      setForm({
        titulo: '',
        descricao: '',
        requisitos: '',
        categoria: '',
        perfil_disc_D: 1,
        perfil_disc_I: 1,
        perfil_disc_S: 1,
        perfil_disc_C: 1,
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
      setSaving(false)
    } catch (error: any) {
      console.error('❌ Erro completo:', error)
      toast.error('Erro ao criar vaga: ' + error.message)
      setSaving(false)
    }
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
          <h1 className="text-3xl font-bold text-foreground">Criar Nova Vaga</h1>
          <p className="text-muted-foreground">Preencha os detalhes para criar um rascunho da vaga</p>
        </div>
      </div>

      <form onSubmit={handleCreate}>
        <div className="grid gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Informações Principais</CardTitle>
              <CardDescription>Detalhes básicos que os candidatos verão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título da Vaga *</Label>
                  <Input 
                    value={form.titulo} 
                    onChange={e => setForm({ ...form, titulo: e.target.value })} 
                    required 
                    className="bg-background" 
                    placeholder="Ex: Desenvolvedor Front-end Pleno"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input 
                    value={form.categoria} 
                    onChange={e => setForm({ ...form, categoria: e.target.value })} 
                    className="bg-background" 
                    placeholder="Ex: Tecnologia, Financeiro, Vendas" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição da Vaga</Label>
                <Textarea 
                  value={form.descricao} 
                  onChange={e => setForm({ ...form, descricao: e.target.value })} 
                  className="bg-background min-h-[120px]" 
                  placeholder="Descreva as responsabilidades e o dia a dia da vaga..."
                />
              </div>

              <div className="space-y-2">
                <Label>Requisitos</Label>
                <Textarea 
                  value={form.requisitos} 
                  onChange={e => setForm({ ...form, requisitos: e.target.value })} 
                  className="bg-background min-h-[100px]" 
                  placeholder="Liste as habilidades, qualificações e experiências necessárias..."
                />
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-300">
                  ℹ️ Esta vaga será criada como rascunho. Após revisar todos os detalhes, você poderá confirmar a vaga para torná-la visível aos candidatos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Perfil Comportamental Ideal (DISC)</CardTitle>
              <CardDescription>Defina os pesos desejados para fit cultural da posição (valores numéricos)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2 p-4 bg-background border rounded-lg">
                  <Label className="font-bold text-red-400">D - Dominância</Label>
                  <Input
                    type="number" min={0}
                    value={form.perfil_disc_D}
                    onChange={e => setForm({ ...form, perfil_disc_D: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Foco em resultados e ação</p>
                </div>
                <div className="space-y-2 p-4 bg-background border rounded-lg">
                  <Label className="font-bold text-yellow-400">I - Influência</Label>
                  <Input
                    type="number" min={0}
                    value={form.perfil_disc_I}
                    onChange={e => setForm({ ...form, perfil_disc_I: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Comunicação e persuasão</p>
                </div>
                <div className="space-y-2 p-4 bg-background border rounded-lg">
                  <Label className="font-bold text-green-400">S - Estabilidade</Label>
                  <Input
                    type="number" min={0}
                    value={form.perfil_disc_S}
                    onChange={e => setForm({ ...form, perfil_disc_S: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Paciência e previsibilidade</p>
                </div>
                <div className="space-y-2 p-4 bg-background border rounded-lg">
                  <Label className="font-bold text-blue-400">C - Conformidade</Label>
                  <Input
                    type="number" min={0}
                    value={form.perfil_disc_C}
                    onChange={e => setForm({ ...form, perfil_disc_C: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Precisão e regras</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Teste Aplicado</CardTitle>
              <CardDescription>Selecione qual template de testes será aplicado aos candidatos desta vaga (opcional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Informações de Contrato</CardTitle>
              <CardDescription>Detalhes sobre o tipo de contrato e compensação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    type="number"
                    step="0.01"
                    value={form.salario}
                    onChange={e => setForm({ ...form, salario: e.target.value })}
                    className="bg-background"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                <Label>Departamento/Setor</Label>
                <Input
                  value={form.departamento}
                  onChange={e => setForm({ ...form, departamento: e.target.value })}
                  className="bg-background"
                  placeholder="Ex: Engenharia, Comercial, RH"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Especificações Técnicas</CardTitle>
              <CardDescription>Habilidades, idiomas e requisitos educacionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Diferenciais e Benefícios</CardTitle>
              <CardDescription>O que você oferece e pontos diferenciais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] gap-2" disabled={saving}>
              {saving ? 'Criando...' : <><Save className="w-4 h-4"/> Criar Rascunho</>}
            </Button>
          </div>
        </div>
      </form>
      </div>
    </>
  )
}
