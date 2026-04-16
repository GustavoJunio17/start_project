'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DISCOption {
  texto: string
  dimensao: 'D' | 'I' | 'S' | 'C'
}

interface DISCQuestionProps {
  index: number
  pergunta: string
  opcoes: DISCOption[]
  selectedAnswer: string | undefined
  onAnswer: (answer: string) => void
}

const DIMENSAO_COLORS = {
  D: '#EF4444',
  I: '#F59E0B',
  S: '#10B981',
  C: '#0066FF',
}

export function DISCQuestion({ index, pergunta, opcoes, selectedAnswer, onAnswer }: DISCQuestionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">
          <span className="text-[#00D4FF] mr-2">{index + 1}.</span>
          {pergunta}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAnswer || ''} onValueChange={onAnswer}>
          {opcoes.map((opcao, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              <RadioGroupItem value={opcao.texto} id={`q${index}-opt${i}`} />
              <Label htmlFor={`q${index}-opt${i}`} className="cursor-pointer flex-1 text-sm text-foreground">
                {opcao.texto}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
