'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function NovaVagaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    requisitos: '',
    categoria: '',
    perfil_disc_D: 25,
    perfil_disc_I: 25,
    perfil_disc_S: 25,
    perfil_disc_C: 25,
  })
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) {
      toast.error('Usuário não está associado a uma empresa')
      return
    }
    
    setSaving(true)
    try {
      const { error } = await supabase.from('vagas').insert({
        empresa_id: user.empresa_id,
        titulo: form.titulo,
        descricao: form.descricao,
        requisitos: form.requisitos,
        categoria: form.categoria,
        perfil_disc_ideal: {
          D: form.perfil_disc_D,
          I: form.perfil_disc_I,
          S: form.perfil_disc_S,
          C: form.perfil_disc_C
        },
        criado_por: user.id,
        status: 'rascunho'
      })

      if (error) throw error

      toast.success('Vaga criada com sucesso!')
      router.push('/empresa/vagas')
    } catch (error: any) {
      toast.error('Erro ao criar vaga: ' + error.message)
      setSaving(false)
    }
  }

  return (
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
  )
}
