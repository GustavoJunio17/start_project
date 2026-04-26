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
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function NovoTemplatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [templateForm, setTemplateForm] = useState({ nome: '', descricao: '' })
  const [templateQuestoes, setTemplateQuestoes] = useState<{ pergunta: string; opcao_d: string; opcao_i: string; opcao_s: string; opcao_c: string }[]>([])
  const [newQuestion, setNewQuestion] = useState({ pergunta: '', opcao_d: '', opcao_i: '', opcao_s: '', opcao_c: '' })
  const supabase = createClient()

  const handleAddQuestionToTemplate = () => {
    if (!newQuestion.pergunta.trim()) {
      toast.error('Pergunta é obrigatória')
      return
    }
    if (!newQuestion.opcao_d.trim() || !newQuestion.opcao_i.trim() || !newQuestion.opcao_s.trim() || !newQuestion.opcao_c.trim()) {
      toast.error('Todas as opções (D, I, S, C) são obrigatórias')
      return
    }
    setTemplateQuestoes([...templateQuestoes, { ...newQuestion }])
    setNewQuestion({ pergunta: '', opcao_d: '', opcao_i: '', opcao_s: '', opcao_c: '' })
  }

  const handleRemoveQuestionFromTemplate = (index: number) => {
    setTemplateQuestoes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id) {
      toast.error('Usuário não associado a empresa')
      return
    }
    if (!templateForm.nome.trim()) {
      toast.error('Nome do template é obrigatório')
      return
    }
    if (templateQuestoes.length === 0) {
      toast.error('Adicione pelo menos uma questão')
      return
    }

    setSaving(true)
    try {
      const { data: insertedTemplates, error: templateError } = await supabase
        .from('templates_testes')
        .insert({
          empresa_id: user.empresa_id,
          nome: templateForm.nome,
          descricao: templateForm.descricao || null,
          questoes_ids: Array(templateQuestoes.length).fill(''),
        })
        .select()

      if (templateError || !insertedTemplates || insertedTemplates.length === 0) {
        throw new Error(templateError?.message || 'Erro ao criar template')
      }

      const templateData = insertedTemplates[0]

      const questoesInsert = templateQuestoes.map((q) => ({
        empresa_id: user.empresa_id,
        template_testes_id: templateData.id,
        pergunta: q.pergunta,
        opcoes: [
          { texto: q.opcao_d, dimensao: 'D' as const },
          { texto: q.opcao_i, dimensao: 'I' as const },
          { texto: q.opcao_s, dimensao: 'S' as const },
          { texto: q.opcao_c, dimensao: 'C' as const },
        ],
      }))

      const { error: questoesError } = await supabase.from('questoes_disc').insert(questoesInsert)

      if (questoesError) {
        throw new Error(questoesError.message)
      }

      toast.success('Template criado com sucesso!')
      router.push('/empresa/testes')
    } catch (error: any) {
      toast.error('Erro ao criar template: ' + error.message)
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
            <h1 className="text-3xl font-bold text-foreground">Criar Novo Template</h1>
            <p className="text-muted-foreground">Crie um template de testes com suas questões DISC</p>
          </div>
        </div>

        <form onSubmit={handleCreateTemplate}>
          <div className="grid gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Informações do Template</CardTitle>
                <CardDescription>Dados básicos do template de testes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Template *</Label>
                  <Input
                    value={templateForm.nome}
                    onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })}
                    required
                    className="bg-background"
                    placeholder="Ex: Avaliação DISC Inicial, Teste Pleno, etc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={templateForm.descricao}
                    onChange={(e) => setTemplateForm({ ...templateForm, descricao: e.target.value })}
                    className="bg-background"
                    placeholder="Descrição opcional do template"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Questões do Template ({templateQuestoes.length})</CardTitle>
                <CardDescription>Adicione as questões que farão parte deste template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lista de questões adicionadas */}
                {templateQuestoes.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Questões Adicionadas:</div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {templateQuestoes.map((q, idx) => (
                        <div key={idx} className="p-4 rounded bg-background border border-border">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground mb-2">{idx + 1}. {q.pergunta}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <p className="text-xs text-muted-foreground">
                                  <span style={{ color: '#EF4444' }} className="font-medium">D:</span> {q.opcao_d}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <span style={{ color: '#F59E0B' }} className="font-medium">I:</span> {q.opcao_i}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <span style={{ color: '#10B981' }} className="font-medium">S:</span> {q.opcao_s}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <span style={{ color: '#0066FF' }} className="font-medium">C:</span> {q.opcao_c}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromTemplate(idx)}
                              className="ml-2 text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulário para adicionar nova questão */}
                <div className="border-t border-border pt-6">
                  <div className="text-sm font-medium text-muted-foreground mb-4">Adicionar Nova Questão:</div>
                  <div className="space-y-4 p-4 bg-background border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Pergunta *</Label>
                      <Textarea
                        value={newQuestion.pergunta}
                        onChange={(e) => setNewQuestion({ ...newQuestion, pergunta: e.target.value })}
                        className="bg-card text-sm"
                        placeholder="Digite a pergunta"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {(
                        [
                          { key: 'opcao_d', label: 'D — Dominância', color: '#EF4444' },
                          { key: 'opcao_i', label: 'I — Influência', color: '#F59E0B' },
                          { key: 'opcao_s', label: 'S — Estabilidade', color: '#10B981' },
                          { key: 'opcao_c', label: 'C — Conformidade', color: '#0066FF' },
                        ] as const
                      ).map((o) => (
                        <div key={o.key} className="space-y-2">
                          <Label className="text-xs font-medium" style={{ color: o.color }}>
                            {o.label} *
                          </Label>
                          <Input
                            value={newQuestion[o.key]}
                            onChange={(e) => setNewQuestion({ ...newQuestion, [o.key]: e.target.value })}
                            className="bg-card text-sm h-9"
                            placeholder="Opção"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddQuestionToTemplate}
                      variant="outline"
                      className="w-full text-sm"
                      disabled={!newQuestion.pergunta.trim() || !newQuestion.opcao_d.trim() || !newQuestion.opcao_i.trim() || !newQuestion.opcao_s.trim() || !newQuestion.opcao_c.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Questão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] gap-2" disabled={saving || !templateForm.nome.trim() || templateQuestoes.length === 0}>
                {saving ? 'Criando...' : <><Save className="w-4 h-4" /> Criar Template</>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
