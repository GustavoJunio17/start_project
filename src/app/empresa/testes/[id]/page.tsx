'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { TemplateTeste, QuestaoDisc } from '@/types/database'
import { ArrowLeft, Edit2 } from 'lucide-react'

const supabase = createClient()
const COR_DIMENSAO: Record<string, string> = { D: 'text-red-400', I: 'text-yellow-400', S: 'text-green-400', C: 'text-blue-400' }
const NOMES_DIMENSAO: Record<string, string> = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' }

export default function TemplateDetalhesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  const [template, setTemplate] = useState<TemplateTeste | null>(null)
  const [questoes, setQuestoes] = useState<QuestaoDisc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.empresa_id || !templateId) return
    async function load() {
      const templateRes = await supabase.from('templates_testes').select('*').eq('id', templateId).eq('empresa_id', user!.empresa_id).single()
      if (templateRes.data) {
        setTemplate(templateRes.data)
        const questoesRes = await supabase.from('questoes_disc').select('*').in('id', templateRes.data.questoes_ids)
        setQuestoes(questoesRes.data || [])
      }
      setLoading(false)
    }
    load()
  }, [user, templateId])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
    </div>
  )

  if (!template) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-gray-400">Template não encontrado</p>
      <button onClick={() => router.push('/empresa/testes')}
        className="flex items-center gap-2 px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/empresa/testes')}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{template.nome}</h1>
            {template.descricao && <p className="text-sm text-gray-400 mt-0.5">{template.descricao}</p>}
          </div>
        </div>
        <button onClick={() => router.push(`/empresa/testes/${template.id}/editar`)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          <Edit2 className="w-3.5 h-3.5" /> Editar
        </button>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
        <p className="text-3xl font-bold text-[#00D4FF]">{questoes.length}</p>
        <p className="text-sm text-gray-400 mt-1">Questões</p>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a5e]">
          <p className="text-base font-semibold text-white">Questões do Template</p>
        </div>
        <div className="p-5 space-y-6">
          {questoes.map((q, idx) => (
            <div key={q.id} className="border-b border-[#1e2a5e] last:border-0 pb-6 last:pb-0">
              <div className="flex gap-4">
                <span className="text-sm font-bold text-[#00D4FF] min-w-6">{idx + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-3">{q.pergunta}</p>
                  <div className="space-y-2">
                    {q.opcoes.map((opcao, opcaoIdx) => (
                      <div key={opcaoIdx} className="flex items-start gap-2 ml-2">
                        <span className={`text-xs font-bold ${COR_DIMENSAO[opcao.dimensao]}`}>{opcao.dimensao}</span>
                        <p className="text-xs text-gray-400 flex-1">{opcao.texto}</p>
                        <span className={`text-xs font-semibold ${COR_DIMENSAO[opcao.dimensao]}`}>({NOMES_DIMENSAO[opcao.dimensao]})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
