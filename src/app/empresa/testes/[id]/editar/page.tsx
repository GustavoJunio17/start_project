'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TemplateTeste, QuestaoDisc } from '@/types/database'
import { ArrowLeft, Trash2, Save, Edit2, X } from 'lucide-react'

const supabase = createClient()

export default function TemplateEditarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [template, setTemplate] = useState<TemplateTeste | null>(null)
  const [questoes, setQuestoes] = useState<QuestaoDisc[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [questaoEditando, setQuestaoEditando] = useState<QuestaoDisc | null>(null)
  const [perguntaEditando, setPerguntaEditando] = useState('')
  const [opcoesEditando, setOpcoesEditando] = useState<{ texto: string; dimensao: 'D' | 'I' | 'S' | 'C' }[]>([])

  useEffect(() => {
    if (!user?.empresa_id || !templateId) return

    async function load() {
      const templateRes = await supabase
        .from('templates_testes')
        .select('*')
        .eq('id', templateId)
        .eq('empresa_id', user!.empresa_id)
        .single()

      if (templateRes.data) {
        setTemplate(templateRes.data)
        setNome(templateRes.data.nome)
        setDescricao(templateRes.data.descricao || '')

        const questoesRes = await supabase
          .from('questoes_disc')
          .select('*')
          .in('id', templateRes.data.questoes_ids)

        setQuestoes(questoesRes.data || [])
      }

      setLoading(false)
    }

    load()
  }, [user, templateId])

  const handleSave = async () => {
    if (!template) return

    setSaving(true)
    try {
      await supabase
        .from('templates_testes')
        .update({
          nome,
          descricao: descricao || null,
        })
        .eq('id', template.id)

      router.push(`/empresa/testes/${template.id}`)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveQuestao = async (questaoId: string) => {
    if (!template) return

    const novasQuestoes = questoes.filter((q) => q.id !== questaoId)
    const novasQuestoesIds = novasQuestoes.map((q) => q.id)

    try {
      await supabase
        .from('templates_testes')
        .update({ questoes_ids: novasQuestoesIds })
        .eq('id', template.id)

      setTemplate({ ...template, questoes_ids: novasQuestoesIds })
      setQuestoes(novasQuestoes)
    } catch (error) {
      console.error('Erro ao remover questão:', error)
    }
  }

  const handleAbrirEditarQuestao = (questao: QuestaoDisc) => {
    setQuestaoEditando(questao)
    setPerguntaEditando(questao.pergunta)
    setOpcoesEditando([...questao.opcoes])
  }

  const handleSalvarQuestao = async () => {
    if (!questaoEditando) return

    try {
      await supabase
        .from('questoes_disc')
        .update({
          pergunta: perguntaEditando,
          opcoes: opcoesEditando,
        })
        .eq('id', questaoEditando.id)

      const questoesAtualizadas = questoes.map((q) =>
        q.id === questaoEditando.id
          ? { ...q, pergunta: perguntaEditando, opcoes: opcoesEditando }
          : q
      )
      setQuestoes(questoesAtualizadas)
      setQuestaoEditando(null)
    } catch (error) {
      console.error('Erro ao salvar questão:', error)
    }
  }

  const handleEditarOpcao = (idx: number, campo: string, valor: unknown) => {
    const novasOpcoes = [...opcoesEditando]
    if (campo === 'texto') {
      novasOpcoes[idx].texto = valor as string
    } else if (campo === 'dimensao') {
      novasOpcoes[idx].dimensao = valor as 'D' | 'I' | 'S' | 'C'
    }
    setOpcoesEditando(novasOpcoes)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Template não encontrado</p>
        <Button variant="outline" onClick={() => router.push('/empresa/testes')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/empresa/testes/${template.id}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Editar Template</h1>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a5e]">
          <p className="font-semibold text-white">Informações do Template</p>
        </div>
        <div className="p-5">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium">
              Nome
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-2 bg-background border-border"
              placeholder="ex: DISC Padrão"
            />
          </div>

          <div>
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mt-2 bg-background border-border"
              placeholder="ex: Avaliação completa com 16 questões"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/empresa/testes/${template.id}`)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a5e]">
          <p className="font-semibold text-white">
            Questões ({questoes.length})
          </p>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {questoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma questão no template
              </p>
            ) : (
              questoes.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded bg-background border border-border group relative"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-bold text-[#00D4FF] min-w-8">
                          {idx + 1}.
                        </span>
                        <p className="text-sm font-medium text-foreground">{q.pergunta}</p>
                      </div>
                      <div className="mt-3 ml-6 space-y-1">
                        {q.opcoes.map((opcao, opcaoIdx) => {
                          const coresOpcoes: Record<string, string> = {
                            D: 'bg-red-500/20 text-red-400',
                            I: 'bg-yellow-500/20 text-yellow-400',
                            S: 'bg-green-500/20 text-green-400',
                            C: 'bg-blue-500/20 text-blue-400',
                          }
                          return (
                            <div key={opcaoIdx} className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${
                                  coresOpcoes[opcao.dimensao]
                                }`}
                              >
                                {opcao.dimensao}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {opcao.texto}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAbrirEditarQuestao(q)}
                        className="text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                        title="Editar questão"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveQuestao(q.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                        title="Remover questão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de edição de questão */}
      {questaoEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-[#1e2a5e] flex items-center justify-between">
              <p className="font-semibold text-white">Editar Questão</p>
              <button onClick={() => setQuestaoEditando(null)}
                className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div>
                <Label htmlFor="pergunta-edit" className="text-sm font-medium">
                  Pergunta
                </Label>
                <Input
                  id="pergunta-edit"
                  value={perguntaEditando}
                  onChange={(e) => setPerguntaEditando(e.target.value)}
                  className="mt-2 bg-background border-border"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Opções</Label>
                <div className="space-y-3">
                  {opcoesEditando.map((opcao, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 rounded bg-background border border-border">
                      <div className="flex-1">
                        <Label htmlFor={`opcao-texto-${idx}`} className="text-xs font-medium text-muted-foreground">
                          Texto da opção {idx + 1}
                        </Label>
                        <Input
                          id={`opcao-texto-${idx}`}
                          value={opcao.texto}
                          onChange={(e) => handleEditarOpcao(idx, 'texto', e.target.value)}
                          className="mt-1 bg-card border-border"
                          placeholder="Digite a opção"
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`opcao-dimensao-${idx}`} className="text-xs font-medium text-muted-foreground">
                          Dimensão
                        </Label>
                        <select
                          id={`opcao-dimensao-${idx}`}
                          value={opcao.dimensao}
                          onChange={(e) =>
                            handleEditarOpcao(idx, 'dimensao', e.target.value)
                          }
                          className="mt-1 w-full px-2 py-1 rounded bg-card border border-border text-foreground text-sm"
                        >
                          <option value="D">D</option>
                          <option value="I">I</option>
                          <option value="S">S</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setQuestaoEditando(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
                  onClick={handleSalvarQuestao}
                >
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
