'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'

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
      const { data: insertedTemplates, error: templateError } = await (supabase
        .from('templates_testes')
        .insert({
          empresa_id: user!.empresa_id,
          nome: templateForm.nome,
          descricao: templateForm.descricao || null,
          questoes_ids: Array(templateQuestoes.length).fill('') as string[],
        }) as any)
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
          <button type="button" onClick={() => router.back()} className="p-1.5 rounded-lg border border-[#1e2a5e] text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Criar Novo Template</h1>
            <p className="text-gray-400">Crie um template de testes com suas questões DISC</p>
          </div>
        </div>

        <form onSubmit={handleCreateTemplate}>
          <div className="grid gap-6">
            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5 space-y-4">
              <div>
                <p className="font-semibold text-white">Informações do Template</p>
                <p className="text-sm text-gray-400">Dados básicos do template de testes</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Nome do Template *</label>
                <input value={templateForm.nome} onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })} required
                  className="w-full px-3 py-2.5 bg-[#0A0E27] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors placeholder-gray-600"
                  placeholder="Ex: Avaliação DISC Inicial, Teste Pleno, etc" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Descrição</label>
                <textarea value={templateForm.descricao} onChange={(e) => setTemplateForm({ ...templateForm, descricao: e.target.value })} rows={3}
                  className="w-full px-3 py-2.5 bg-[#0A0E27] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors placeholder-gray-600 resize-none"
                  placeholder="Descrição opcional do template" />
              </div>
            </div>

            <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5 space-y-6">
              <div>
                <p className="font-semibold text-white">Questões do Template ({templateQuestoes.length})</p>
                <p className="text-sm text-gray-400">Adicione as questões que farão parte deste template</p>
              </div>
                {/* Lista de questões adicionadas */}
                {templateQuestoes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-400">Questões Adicionadas:</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {templateQuestoes.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-[#0A0E27] border border-[#1e2a5e]">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white mb-2">{idx + 1}. {q.pergunta}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <p className="text-xs text-gray-500"><span className="font-bold text-red-400">D:</span> {q.opcao_d}</p>
                                <p className="text-xs text-gray-500"><span className="font-bold text-yellow-400">I:</span> {q.opcao_i}</p>
                                <p className="text-xs text-gray-500"><span className="font-bold text-green-400">S:</span> {q.opcao_s}</p>
                                <p className="text-xs text-gray-500"><span className="font-bold text-blue-400">C:</span> {q.opcao_c}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => handleRemoveQuestionFromTemplate(idx)}
                              className="ml-2 p-1 text-gray-500 hover:text-[#EF4444] transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulário para adicionar nova questão */}
                <div className="border-t border-[#1e2a5e] pt-6">
                  <p className="text-sm font-medium text-gray-400 mb-4">Adicionar Nova Questão:</p>
                  <div className="space-y-4 p-4 bg-[#0A0E27] border border-[#1e2a5e] rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Pergunta *</label>
                      <textarea value={newQuestion.pergunta} onChange={(e) => setNewQuestion({ ...newQuestion, pergunta: e.target.value })} rows={2}
                        className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors placeholder-gray-600 resize-none"
                        placeholder="Digite a pergunta" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {([
                        { key: 'opcao_d', label: 'D — Dominância', color: 'text-red-400' },
                        { key: 'opcao_i', label: 'I — Influência', color: 'text-yellow-400' },
                        { key: 'opcao_s', label: 'S — Estabilidade', color: 'text-green-400' },
                        { key: 'opcao_c', label: 'C — Conformidade', color: 'text-blue-400' },
                      ] as const).map((o) => (
                        <div key={o.key} className="space-y-1.5">
                          <label className={`text-xs font-medium ${o.color}`}>{o.label} *</label>
                          <input value={newQuestion[o.key]} onChange={(e) => setNewQuestion({ ...newQuestion, [o.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors placeholder-gray-600"
                            placeholder="Opção" />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={handleAddQuestionToTemplate}
                      disabled={!newQuestion.pergunta.trim() || !newQuestion.opcao_d.trim() || !newQuestion.opcao_i.trim() || !newQuestion.opcao_s.trim() || !newQuestion.opcao_c.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus className="w-4 h-4" /> Adicionar Questão
                    </button>
                  </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => router.back()} disabled={saving}
                className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving || !templateForm.nome.trim() || templateQuestoes.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Criando...' : 'Criar Template'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
