'use client'

import { useEffect, useState, use } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Opcao {
  texto: string
  dimensao: 'D' | 'I' | 'S' | 'C'
}

interface Questao {
  id: string
  pergunta: string
  opcoes: Opcao[]
}

type PageState = 'loading' | 'error' | 'test' | 'done'

export default function ResponderTestePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [candidatoNome, setCandidatoNome] = useState('')
  const [templateNome, setTemplateNome] = useState('')
  const [tipoParticipante, setTipoParticipante] = useState<'candidato' | 'colaborador'>('candidato')
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [current, setCurrent] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, 'D' | 'I' | 'S' | 'C'>>({})
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    fetch(`/api/testes/publico/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErrorMsg(data.error); setPageState('error'); return }
        setCandidatoNome(data.nome || data.candidato_nome || '')
        setTemplateNome(data.template_nome)
        if (data.tipo) setTipoParticipante(data.tipo)
        setQuestoes(data.questoes)
        setPageState('test')
      })
      .catch(() => { setErrorMsg('Erro ao carregar o teste.'); setPageState('error') })
  }, [token])

  const questao = questoes[current]
  const totalQ = questoes.length
  const progress = totalQ > 0 ? Math.round(((current) / totalQ) * 100) : 0
  const answered = Object.keys(respostas).length
  const allAnswered = answered === totalQ

  const selectOpcao = (dimensao: 'D' | 'I' | 'S' | 'C') => {
    setRespostas(prev => ({ ...prev, [questao.id]: dimensao }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/testes/publico/${token}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas }),
      })
      if (res.ok) setPageState('done')
      else {
        const d = await res.json()
        setErrorMsg(d.error || 'Erro ao enviar respostas')
        setPageState('error')
      }
    } catch {
      setErrorMsg('Erro ao enviar respostas')
      setPageState('error')
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-[#00D4FF]" />
          <p className="text-muted-foreground">Carregando teste...</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-white">Link inválido</h1>
          <p className="text-muted-foreground">{errorMsg}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'done') {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Teste concluído!</h1>
            <p className="text-muted-foreground">
              Obrigado, <strong className="text-white">{candidatoNome}</strong>.<br />
              Suas respostas foram registradas com sucesso.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            O resultado será analisado pela empresa e você será notificado em breve.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">START PRO</p>
            <p className="text-sm font-medium text-white">{templateNome}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground capitalize">{tipoParticipante}</p>
            <p className="text-sm text-white font-medium">{candidatoNome}</p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-1 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full space-y-8">
          {/* Counter */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Pergunta <span className="text-white font-semibold">{current + 1}</span> de <span className="text-white font-semibold">{totalQ}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {answered} de {totalQ} respondidas
            </span>
          </div>

          {/* Question */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
              {questao?.pergunta}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {questao?.opcoes.map((op, i) => {
              const selected = respostas[questao.id] === op.dimensao
              return (
                <button
                  key={i}
                  onClick={() => selectOpcao(op.dimensao)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                    selected
                      ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">{op.texto}</span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-white gap-2"
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>

            {current < totalQ - 1 ? (
              <Button
                className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90 gap-2 px-6"
                disabled={!respostas[questao?.id]}
                onClick={() => setCurrent(c => c + 1)}
              >
                Próxima <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 px-8"
                disabled={!allAnswered || submitting}
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Respostas'}
              </Button>
            )}
          </div>

          {/* Dots navigation */}
          {totalQ <= 30 && (
            <div className="flex justify-center gap-1.5 flex-wrap pt-2">
              {questoes.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current
                      ? 'bg-[#00D4FF] w-6'
                      : respostas[q.id]
                      ? 'bg-[#00D4FF]/40'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
