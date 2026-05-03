'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Progress } from '@/components/ui/progress'
import { DISCBars } from '@/components/disc/DISCChart'
import type { QuestaoDisc, Candidato, TipoTeste, PerfilDISC } from '@/types/database'
import { ClipboardList, Play, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_DISC_QUESTIONS: Omit<QuestaoDisc, 'id' | 'empresa_id' | 'vaga_id'>[] = [
  { pergunta: 'Em uma reuniao de equipe, voce geralmente:', opcoes: [ { texto: 'Assume a lideranca e direciona a conversa', dimensao: 'D' }, { texto: 'Anima o grupo e sugere ideias criativas', dimensao: 'I' }, { texto: 'Ouve atentamente e busca consenso', dimensao: 'S' }, { texto: 'Analisa dados e questiona a viabilidade', dimensao: 'C' } ] },
  { pergunta: 'Quando enfrenta um problema no trabalho:', opcoes: [ { texto: 'Age rapidamente para resolver', dimensao: 'D' }, { texto: 'Conversa com colegas para encontrar solucoes', dimensao: 'I' }, { texto: 'Avalia calmamente antes de tomar uma decisao', dimensao: 'S' }, { texto: 'Pesquisa e analisa todas as opcoes possiveis', dimensao: 'C' } ] },
  { pergunta: 'O que mais te motiva no trabalho:', opcoes: [ { texto: 'Desafios e resultados', dimensao: 'D' }, { texto: 'Reconhecimento e interacao social', dimensao: 'I' }, { texto: 'Estabilidade e harmonia na equipe', dimensao: 'S' }, { texto: 'Qualidade e precisao do trabalho', dimensao: 'C' } ] },
  { pergunta: 'Quando precisa tomar uma decisao importante:', opcoes: [ { texto: 'Decide rapidamente com base na intuicao', dimensao: 'D' }, { texto: 'Consulta pessoas de confianca', dimensao: 'I' }, { texto: 'Pondera com calma antes de decidir', dimensao: 'S' }, { texto: 'Coleta todos os fatos e dados disponiveis', dimensao: 'C' } ] },
  { pergunta: 'Em situacoes de conflito:', opcoes: [ { texto: 'Confronta diretamente o problema', dimensao: 'D' }, { texto: 'Tenta mediar e manter todos felizes', dimensao: 'I' }, { texto: 'Evita confrontos e busca harmonia', dimensao: 'S' }, { texto: 'Analisa logicamente quem tem razao', dimensao: 'C' } ] },
  { pergunta: 'Seu estilo de comunicacao e:', opcoes: [ { texto: 'Direto e objetivo', dimensao: 'D' }, { texto: 'Entusiasmado e expressivo', dimensao: 'I' }, { texto: 'Calmo e paciente', dimensao: 'S' }, { texto: 'Detalhado e preciso', dimensao: 'C' } ] },
  { pergunta: 'No ambiente de trabalho ideal:', opcoes: [ { texto: 'Voce tem autonomia para decidir', dimensao: 'D' }, { texto: 'Ha colaboracao e espirito de equipe', dimensao: 'I' }, { texto: 'O ambiente e previsivel e organizado', dimensao: 'S' }, { texto: 'Existem regras claras e processos definidos', dimensao: 'C' } ] },
  { pergunta: 'Quando recebe feedback negativo:', opcoes: [ { texto: 'Usa como combustivel para melhorar', dimensao: 'D' }, { texto: 'Fica abalado mas busca apoio dos colegas', dimensao: 'I' }, { texto: 'Reflete internamente sobre o que mudar', dimensao: 'S' }, { texto: 'Analisa se o feedback e justo e factual', dimensao: 'C' } ] },
  { pergunta: 'O que os outros mais admiram em voce:', opcoes: [ { texto: 'Determinacao e foco em resultados', dimensao: 'D' }, { texto: 'Carisma e capacidade de inspirar', dimensao: 'I' }, { texto: 'Lealdade e confiabilidade', dimensao: 'S' }, { texto: 'Competencia tecnica e atencao aos detalhes', dimensao: 'C' } ] },
  { pergunta: 'Quando comeca um projeto novo:', opcoes: [ { texto: 'Define metas e vai direto a execucao', dimensao: 'D' }, { texto: 'Compartilha a ideia e reune a equipe', dimensao: 'I' }, { texto: 'Planeja passo a passo antes de comecar', dimensao: 'S' }, { texto: 'Pesquisa referencias e cria um plano detalhado', dimensao: 'C' } ] },
  { pergunta: 'Sob pressao, voce tende a:', opcoes: [ { texto: 'Ficar mais focado e exigente', dimensao: 'D' }, { texto: 'Falar mais e buscar ajuda', dimensao: 'I' }, { texto: 'Se retrair e ficar quieto', dimensao: 'S' }, { texto: 'Se apegar ainda mais aos processos', dimensao: 'C' } ] },
  { pergunta: 'Nas suas ferias ideais:', opcoes: [ { texto: 'Aventura e atividades radicais', dimensao: 'D' }, { texto: 'Festa e socializacao', dimensao: 'I' }, { texto: 'Descanso e tranquilidade', dimensao: 'S' }, { texto: 'Roteiro planejado e cultural', dimensao: 'C' } ] },
  { pergunta: 'Seu maior medo profissional e:', opcoes: [ { texto: 'Perder o controle da situacao', dimensao: 'D' }, { texto: 'Ser rejeitado ou ignorado', dimensao: 'I' }, { texto: 'Mudancas bruscas e instabilidade', dimensao: 'S' }, { texto: 'Cometer erros ou falhar', dimensao: 'C' } ] },
  { pergunta: 'Quando liderando uma equipe:', opcoes: [ { texto: 'Define a direcao e cobra resultados', dimensao: 'D' }, { texto: 'Motiva e celebra conquistas', dimensao: 'I' }, { texto: 'Apoia individualmente cada membro', dimensao: 'S' }, { texto: 'Organiza processos e monitora qualidade', dimensao: 'C' } ] },
  { pergunta: 'Uma palavra que te define:', opcoes: [ { texto: 'Determinado', dimensao: 'D' }, { texto: 'Entusiasmado', dimensao: 'I' }, { texto: 'Confiavel', dimensao: 'S' }, { texto: 'Analitico', dimensao: 'C' } ] },
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
      const { data } = await supabase.from('candidatos').select('*, vaga:vagas(titulo, perfil_disc_ideal), empresa:empresas(nome)').eq('user_id', user!.id)
      setCandidaturas(data || []); setLoading(false)
    }
    load()
  }, [user])

  const startTest = async (cand: Candidato, type: TipoTeste) => {
    setSelectedCandidatura(cand); setTestType(type); setCurrentQuestion(0); setRespostas({}); setStartTime(Date.now())
    if (type === 'disc') {
      const { data: customQuestions } = await supabase.from('questoes_disc').select('*').or(`empresa_id.eq.${cand.empresa_id},empresa_id.is.null`)
      if (customQuestions && customQuestions.length >= 10) setQuestions(customQuestions.map(q => ({ pergunta: q.pergunta, opcoes: q.opcoes })))
      else setQuestions(DEFAULT_DISC_QUESTIONS)
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
    return { D: Math.round((scores.D / total) * 100), I: Math.round((scores.I / total) * 100), S: Math.round((scores.S / total) * 100), C: Math.round((scores.C / total) * 100) }
  }, [respostas, questions])

  const calculateMatchScore = (perfil: PerfilDISC, ideal: PerfilDISC | null): number | null => {
    if (!ideal) return null
    const diffs = [Math.abs(perfil.D - ideal.D), Math.abs(perfil.I - ideal.I), Math.abs(perfil.S - ideal.S), Math.abs(perfil.C - ideal.C)]
    return Math.round(Math.max(0, 100 - (diffs.reduce((a, b) => a + b, 0) / 4)))
  }

  const submitTest = async () => {
    if (!selectedCandidatura) return
    const duracao = Math.round((Date.now() - startTime) / 1000)
    const perfil = calculateDISC()
    const perfilIdeal = (selectedCandidatura.vaga as any)?.perfil_disc_ideal || null
    const matchScore = calculateMatchScore(perfil, perfilIdeal)
    const classificacao = matchScore !== null ? (matchScore >= 85 ? 'ouro' : matchScore >= 70 ? 'prata' : matchScore >= 50 ? 'bronze' : null) : null
    await supabase.from('respostas_teste').insert({ candidato_id: selectedCandidatura.id, tipo: testType, respostas, resultado: perfil, score: matchScore, duracao_segundos: duracao })
    await supabase.from('candidatos').update({ perfil_disc: perfil, match_score: matchScore, classificacao, status_candidatura: 'em_avaliacao', data_ultimo_teste: new Date().toISOString().split('T')[0] }).eq('id', selectedCandidatura.id)
    setResultado(perfil); setState('result')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" /></div>

  if (state === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#00D4FF]" /> Meus Testes
          </h1>
          <p className="text-gray-400 text-sm mt-1">Realize os testes necessários para as vagas que você se candidatou.</p>
        </div>

        {candidaturas.length === 0 ? (
          <div className="glass-card py-20 text-center border-dashed">
            <ClipboardList size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">Candidate-se a uma vaga para realizar os testes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {candidaturas.map((cand, idx) => (
              <div 
                key={cand.id} 
                className="glass-card p-6 hover:border-[#00D4FF]/20 transition-all group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/10 to-[#0066FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-lg">
                      {(cand.vaga as any)?.titulo?.charAt(0) || 'V'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{(cand.vaga as any)?.titulo || 'Vaga'}</p>
                      <p className="text-sm text-gray-500">{(cand.empresa as any)?.nome}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {cand.perfil_disc ? (
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Concluído
                        </span>
                        <div className="hidden md:block w-48">
                          <DISCBars perfil={cand.perfil_disc} />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startTest(cand, 'disc')}
                        className="btn-primary min-w-[160px]"
                      >
                        <Play className="w-4 h-4" /> Iniciar Teste DISC
                      </button>
                    )}
                  </div>
                </div>
                {cand.perfil_disc && (
                  <div className="mt-6 pt-6 border-t border-white/[0.05] md:hidden">
                    <DISCBars perfil={cand.perfil_disc} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (state === 'test') {
    const q = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const allAnswered = Object.keys(respostas).length === questions.length

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Teste Comportamental (DISC)</h1>
            <p className="text-gray-400 text-sm">Responda com sinceridade como você agiria nestas situações.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
            <Clock className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm font-bold text-white tracking-widest">{currentQuestion + 1} / {questions.length}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00D4FF]">Progresso do Teste</span>
            <span className="text-[10px] font-bold text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
            <div 
              className="h-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF] shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="glass-card p-8 md:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00D4FF]" />
          
          <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
            {q.pergunta}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {q.opcoes.map((opcao, i) => {
              const isSelected = respostas[currentQuestion] === opcao.texto
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion, opcao.texto)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 border-2",
                    isSelected 
                      ? "bg-[#00D4FF]/10 border-[#00D4FF] text-white shadow-[0_0_20px_rgba(0,212,255,0.1)]" 
                      : "bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    isSelected ? "border-[#00D4FF] bg-[#00D4FF]" : "border-gray-600"
                  )}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </div>
                  <span className="text-base font-medium">{opcao.texto}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button 
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} 
            disabled={currentQuestion === 0}
            className="btn-ghost"
          >
            Questão Anterior
          </button>
          
          {currentQuestion < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestion(currentQuestion + 1)} 
              disabled={!respostas[currentQuestion]}
              className="btn-primary min-w-[140px]"
            >
              Próxima Questão
            </button>
          ) : (
            <button 
              onClick={submitTest} 
              disabled={!allAnswered}
              className="btn-primary min-w-[160px] bg-emerald-600 hover:bg-emerald-500"
            >
              Finalizar Teste
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center py-12 animate-in zoom-in-95 duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-150" />
        <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto relative z-10 animate-bounce" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Teste Concluído!</h1>
        <p className="text-gray-400 text-lg">Excelente trabalho. Seus resultados foram processados com sucesso.</p>
      </div>

      {resultado && (
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-center gap-2 text-[#00D4FF]">
            <span className="text-xs font-bold uppercase tracking-widest">Resumo do seu Perfil</span>
          </div>
          <DISCBars perfil={resultado} />
        </div>
      )}

      <div className="pt-8">
        <button 
          onClick={() => setState('list')}
          className="btn-primary min-w-[200px]"
        >
          Voltar para a Lista
        </button>
      </div>
    </div>
  )
}
