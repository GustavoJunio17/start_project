'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { DISCBars } from '@/components/disc/DISCChart'
import type { QuestaoDisc, Candidato, TipoTeste, PerfilDISC } from '@/types/database'
import { ClipboardList, Play, CheckCircle, Clock } from 'lucide-react'

// Default DISC questions
const DEFAULT_DISC_QUESTIONS: Omit<QuestaoDisc, 'id' | 'empresa_id' | 'vaga_id'>[] = [
  { pergunta: 'Em uma reuniao de equipe, voce geralmente:', opcoes: [
    { texto: 'Assume a lideranca e direciona a conversa', dimensao: 'D' },
    { texto: 'Anima o grupo e sugere ideias criativas', dimensao: 'I' },
    { texto: 'Ouve atentamente e busca consenso', dimensao: 'S' },
    { texto: 'Analisa dados e questiona a viabilidade', dimensao: 'C' },
  ]},
  { pergunta: 'Quando enfrenta um problema no trabalho:', opcoes: [
    { texto: 'Age rapidamente para resolver', dimensao: 'D' },
    { texto: 'Conversa com colegas para encontrar solucoes', dimensao: 'I' },
    { texto: 'Avalia calmamente antes de tomar uma decisao', dimensao: 'S' },
    { texto: 'Pesquisa e analisa todas as opcoes possiveis', dimensao: 'C' },
  ]},
  { pergunta: 'O que mais te motiva no trabalho:', opcoes: [
    { texto: 'Desafios e resultados', dimensao: 'D' },
    { texto: 'Reconhecimento e interacao social', dimensao: 'I' },
    { texto: 'Estabilidade e harmonia na equipe', dimensao: 'S' },
    { texto: 'Qualidade e precisao do trabalho', dimensao: 'C' },
  ]},
  { pergunta: 'Quando precisa tomar uma decisao importante:', opcoes: [
    { texto: 'Decide rapidamente com base na intuicao', dimensao: 'D' },
    { texto: 'Consulta pessoas de confianca', dimensao: 'I' },
    { texto: 'Pondera com calma antes de decidir', dimensao: 'S' },
    { texto: 'Coleta todos os fatos e dados disponiveis', dimensao: 'C' },
  ]},
  { pergunta: 'Em situacoes de conflito:', opcoes: [
    { texto: 'Confronta diretamente o problema', dimensao: 'D' },
    { texto: 'Tenta mediar e manter todos felizes', dimensao: 'I' },
    { texto: 'Evita confrontos e busca harmonia', dimensao: 'S' },
    { texto: 'Analisa logicamente quem tem razao', dimensao: 'C' },
  ]},
  { pergunta: 'Seu estilo de comunicacao e:', opcoes: [
    { texto: 'Direto e objetivo', dimensao: 'D' },
    { texto: 'Entusiasmado e expressivo', dimensao: 'I' },
    { texto: 'Calmo e paciente', dimensao: 'S' },
    { texto: 'Detalhado e preciso', dimensao: 'C' },
  ]},
  { pergunta: 'No ambiente de trabalho ideal:', opcoes: [
    { texto: 'Voce tem autonomia para decidir', dimensao: 'D' },
    { texto: 'Ha colaboracao e espirito de equipe', dimensao: 'I' },
    { texto: 'O ambiente e previsivel e organizado', dimensao: 'S' },
    { texto: 'Existem regras claras e processos definidos', dimensao: 'C' },
  ]},
  { pergunta: 'Quando recebe feedback negativo:', opcoes: [
    { texto: 'Usa como combustivel para melhorar', dimensao: 'D' },
    { texto: 'Fica abalado mas busca apoio dos colegas', dimensao: 'I' },
    { texto: 'Reflete internamente sobre o que mudar', dimensao: 'S' },
    { texto: 'Analisa se o feedback e justo e factual', dimensao: 'C' },
  ]},
  { pergunta: 'O que os outros mais admiram em voce:', opcoes: [
    { texto: 'Determinacao e foco em resultados', dimensao: 'D' },
    { texto: 'Carisma e capacidade de inspirar', dimensao: 'I' },
    { texto: 'Lealdade e confiabilidade', dimensao: 'S' },
    { texto: 'Competencia tecnica e atencao aos detalhes', dimensao: 'C' },
  ]},
  { pergunta: 'Quando comeca um projeto novo:', opcoes: [
    { texto: 'Define metas e vai direto a execucao', dimensao: 'D' },
    { texto: 'Compartilha a ideia e reune a equipe', dimensao: 'I' },
    { texto: 'Planeja passo a passo antes de comecar', dimensao: 'S' },
    { texto: 'Pesquisa referencias e cria um plano detalhado', dimensao: 'C' },
  ]},
  { pergunta: 'Sob pressao, voce tende a:', opcoes: [
    { texto: 'Ficar mais focado e exigente', dimensao: 'D' },
    { texto: 'Falar mais e buscar ajuda', dimensao: 'I' },
    { texto: 'Se retrair e ficar quieto', dimensao: 'S' },
    { texto: 'Se apegar ainda mais aos processos', dimensao: 'C' },
  ]},
  { pergunta: 'Nas suas ferias ideais:', opcoes: [
    { texto: 'Aventura e atividades radicais', dimensao: 'D' },
    { texto: 'Festa e socializacao', dimensao: 'I' },
    { texto: 'Descanso e tranquilidade', dimensao: 'S' },
    { texto: 'Roteiro planejado e cultural', dimensao: 'C' },
  ]},
  { pergunta: 'Seu maior medo profissional e:', opcoes: [
    { texto: 'Perder o controle da situacao', dimensao: 'D' },
    { texto: 'Ser rejeitado ou ignorado', dimensao: 'I' },
    { texto: 'Mudancas bruscas e instabilidade', dimensao: 'S' },
    { texto: 'Cometer erros ou falhar', dimensao: 'C' },
  ]},
  { pergunta: 'Quando liderando uma equipe:', opcoes: [
    { texto: 'Define a direcao e cobra resultados', dimensao: 'D' },
    { texto: 'Motiva e celebra conquistas', dimensao: 'I' },
    { texto: 'Apoia individualmente cada membro', dimensao: 'S' },
    { texto: 'Organiza processos e monitora qualidade', dimensao: 'C' },
  ]},
  { pergunta: 'Uma palavra que te define:', opcoes: [
    { texto: 'Determinado', dimensao: 'D' },
    { texto: 'Entusiasmado', dimensao: 'I' },
    { texto: 'Confiavel', dimensao: 'S' },
    { texto: 'Analitico', dimensao: 'C' },
  ]},
]

type TestState = 'list' | 'test' | 'result'

export default function CandidatoTestesPage() {
  const { user } = useAuth()
  const [state, setState] = useState<TestState>('list')
  const [candidaturas, setCandidaturas] = useState<Candidato[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<Omit<QuestaoDisc, 'id' | 'empresa_id' | 'vaga_id'>[]>(DEFAULT_DISC_QUESTIONS)
  const [testType, setTestType] = useState<TipoTeste>('disc')
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidato | null>(null)
  const [resultado, setResultado] = useState<PerfilDISC | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('candidatos')
        .select('*, vaga:vagas(titulo, perfil_disc_ideal), empresa:empresas(nome)')
        .eq('user_id', user!.id)
      setCandidaturas(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const startTest = async (cand: Candidato, type: TipoTeste) => {
    setSelectedCandidatura(cand)
    setTestType(type)
    setCurrentQuestion(0)
    setRespostas({})
    setStartTime(Date.now())

    if (type === 'disc') {
      // Try to load enterprise-specific questions
      const { data: customQuestions } = await supabase
        .from('questoes_disc')
        .select('*')
        .or(`empresa_id.eq.${cand.empresa_id},empresa_id.is.null`)
      if (customQuestions && customQuestions.length >= 10) {
        setQuestions(customQuestions.map(q => ({ pergunta: q.pergunta, opcoes: q.opcoes })))
      } else {
        setQuestions(DEFAULT_DISC_QUESTIONS)
      }
    }
    setState('test')
  }

  const handleAnswer = (questionIndex: number, answer: string) => {
    setRespostas(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const calculateDISC = useCallback((): PerfilDISC => {
    const scores = { D: 0, I: 0, S: 0, C: 0 }
    Object.entries(respostas).forEach(([qIndex, answer]) => {
      const q = questions[parseInt(qIndex)]
      const opcao = q.opcoes.find(o => o.texto === answer)
      if (opcao) scores[opcao.dimensao]++
    })
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
    return {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100),
    }
  }, [respostas, questions])

  const calculateMatchScore = (perfil: PerfilDISC, ideal: PerfilDISC | null): number | null => {
    if (!ideal) return null
    const diffs = [
      Math.abs(perfil.D - ideal.D),
      Math.abs(perfil.I - ideal.I),
      Math.abs(perfil.S - ideal.S),
      Math.abs(perfil.C - ideal.C),
    ]
    const score = Math.max(0, 100 - (diffs.reduce((a, b) => a + b, 0) / 4))
    return Math.round(score)
  }

  const submitTest = async () => {
    if (!selectedCandidatura) return
    const duracao = Math.round((Date.now() - startTime) / 1000)
    const perfil = calculateDISC()
    const perfilIdeal = (selectedCandidatura.vaga as any)?.perfil_disc_ideal || null
    const matchScore = calculateMatchScore(perfil, perfilIdeal)
    const classificacao = matchScore !== null
      ? matchScore >= 85 ? 'ouro' : matchScore >= 70 ? 'prata' : matchScore >= 50 ? 'bronze' : null
      : null

    // Save test result
    await supabase.from('respostas_teste').insert({
      candidato_id: selectedCandidatura.id,
      tipo: testType,
      respostas: respostas,
      resultado: perfil,
      score: matchScore,
      duracao_segundos: duracao,
    })

    // Update candidato profile
    await supabase.from('candidatos').update({
      perfil_disc: perfil,
      match_score: matchScore,
      classificacao,
      status_candidatura: 'em_avaliacao',
      data_ultimo_teste: new Date().toISOString().split('T')[0],
    }).eq('id', selectedCandidatura.id)

    setResultado(perfil)
    setState('result')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" /></div>
  }

  // Test List
  if (state === 'list') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[#00D4FF]" /> Meus Testes
        </h1>

        {candidaturas.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              Candidate-se a uma vaga para realizar os testes.
            </CardContent>
          </Card>
        ) : candidaturas.map(cand => (
          <Card key={cand.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{(cand.vaga as any)?.titulo || 'Vaga'}</p>
                  <p className="text-xs text-muted-foreground">{(cand.empresa as any)?.nome}</p>
                </div>
                <div className="flex items-center gap-2">
                  {cand.perfil_disc ? (
                    <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Concluido</Badge>
                  ) : (
                    <Button size="sm" onClick={() => startTest(cand, 'disc')} className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
                      <Play className="w-4 h-4 mr-1" /> Iniciar Teste DISC
                    </Button>
                  )}
                </div>
              </div>
              {cand.perfil_disc && (
                <div className="mt-3">
                  <DISCBars perfil={cand.perfil_disc} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Active Test
  if (state === 'test') {
    const q = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const allAnswered = Object.keys(respostas).length === questions.length

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Teste DISC</h1>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{currentQuestion + 1}/{questions.length}</span>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">{q.pergunta}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={respostas[currentQuestion] || ''}
              onValueChange={v => handleAnswer(currentQuestion, v)}
            >
              {q.opcoes.map((opcao, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background transition-colors">
                  <RadioGroupItem value={opcao.texto} id={`q${currentQuestion}-${i}`} />
                  <Label htmlFor={`q${currentQuestion}-${i}`} className="cursor-pointer flex-1 text-sm">
                    {opcao.texto}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!respostas[currentQuestion]}
              className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
            >
              Proxima
            </Button>
          ) : (
            <Button
              onClick={submitTest}
              disabled={!allAnswered}
              className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]"
            >
              Finalizar Teste
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Result
  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto" />
      <h1 className="text-2xl font-bold text-foreground">Teste Concluido!</h1>
      <p className="text-muted-foreground">Obrigado por completar o teste. Em breve entraremos em contato.</p>

      {resultado && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Seu Perfil DISC</CardTitle></CardHeader>
          <CardContent><DISCBars perfil={resultado} /></CardContent>
        </Card>
      )}

      <Button onClick={() => setState('list')} className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]">
        Voltar aos Testes
      </Button>
    </div>
  )
}
