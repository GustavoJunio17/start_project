'use client'

import { Badge } from '@/components/ui/badge'
import type { Classificacao } from '@/types/database'
import { cn } from '@/lib/utils'

const CLASSIFICACAO_CONFIG: Record<Classificacao, { label: string; className: string }> = {
  ouro: { label: 'Ouro', className: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30' },
  prata: { label: 'Prata', className: 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/30' },
  bronze: { label: 'Bronze', className: 'bg-[#B45309]/20 text-[#B45309] border-[#B45309]/30' },
}

export function ClassificacaoBadge({ classificacao }: { classificacao: Classificacao | null }) {
  if (!classificacao) return <Badge variant="outline" className="text-muted-foreground">Sem classificacao</Badge>

  const config = CLASSIFICACAO_CONFIG[classificacao]
  return (
    <Badge className={cn('border', config.className)}>
      {config.label}
    </Badge>
  )
}

export function MatchScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null

  const color = score >= 85 ? '#F59E0B' : score >= 70 ? '#94A3B8' : score >= 50 ? '#B45309' : '#EF4444'

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full flex items-center justify-center border-2" style={{ borderColor: color }}>
        <span className="text-sm font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  )
}
