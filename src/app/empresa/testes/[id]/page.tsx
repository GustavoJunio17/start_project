'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TemplateTeste, QuestaoDisc } from '@/types/database'
import { ArrowLeft, Edit2 } from 'lucide-react'

const supabase = createClient()

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
      // Buscar template
      const templateRes = await supabase
        .from('templates_testes')
        .select('*')
        .eq('id', templateId)
        .eq('empresa_id', user.empresa_id)
        .single()

      if (templateRes.data) {
        setTemplate(templateRes.data)

        // Buscar questões
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/empresa/testes')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{template.nome}</h1>
            {template.descricao && (
              <p className="text-sm text-muted-foreground mt-1">{template.descricao}</p>
            )}
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
          onClick={() => router.push(`/empresa/testes/${template.id}/editar`)}
        >
          <Edit2 className="w-4 h-4 mr-2" /> Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-[#00D4FF]">{questoes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Questões</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Questões do Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questoes.map((q, idx) => (
              <div key={q.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                <div className="flex gap-4">
                  <div className="text-sm font-bold text-[#00D4FF] min-w-8">{idx + 1}.</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-4">{q.pergunta}</p>
                    <div className="space-y-2">
                      {q.opcoes.map((opcao, opcaoIdx) => {
                        const corDimensao: Record<string, string> = {
                          D: 'text-red-400',
                          I: 'text-yellow-400',
                          S: 'text-green-400',
                          C: 'text-blue-400',
                        }
                        const nomesDimensao: Record<string, string> = {
                          D: 'Dominância',
                          I: 'Influência',
                          S: 'Estabilidade',
                          C: 'Conformidade',
                        }
                        return (
                          <div key={opcaoIdx} className="flex items-start gap-2 ml-4">
                            <span className={`text-xs font-bold ${corDimensao[opcao.dimensao]}`}>
                              {opcao.dimensao}
                            </span>
                            <p className="text-xs text-muted-foreground flex-1">{opcao.texto}</p>
                            <span className={`text-xs font-semibold ${corDimensao[opcao.dimensao]}`}>
                              ({nomesDimensao[opcao.dimensao]})
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
