'use client'

import { Empresa } from './types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ActionMenu } from './ActionMenu'
import { Users, Briefcase, MessageSquare } from 'lucide-react'

interface CompanyRowProps {
  empresa: Empresa
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (empresa: Empresa) => void
  onEdit: (empresa: Empresa) => void
  onToggleStatus: (empresa: Empresa) => void
  onDelete: (empresa: Empresa) => void
}

export function CompanyRow({
  empresa,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: CompanyRowProps) {
  const statusColors: Record<string, string> = {
    ativa: 'bg-success/20 text-success',
    inativa: 'bg-muted/50 text-muted-foreground',
    trial: 'bg-amber-500/20 text-amber-600',
    bloqueada: 'bg-destructive/20 text-destructive',
  }

  const planoColors: Record<string, string> = {
    free: 'bg-blue-500/20 text-blue-600',
    starter: 'bg-cyan-500/20 text-cyan-600',
    profissional: 'bg-purple-500/20 text-purple-600',
    enterprise: 'bg-pink-500/20 text-pink-600',
  }

  return (
    <tr
      className="border-b border-border hover:bg-background/50 transition cursor-pointer group"
      onClick={() => onView(empresa)}
    >
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(empresa.id)}
          className="bg-background border-border"
        />
      </td>

      {/* Empresa */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{empresa.nome.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-foreground">{empresa.nome}</p>
            <p className="text-xs text-muted-foreground">{empresa.segmento}</p>
          </div>
        </div>
      </td>

      {/* CNPJ */}
      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{empresa.cnpj || '-'}</td>

      {/* Plano */}
      <td className="px-6 py-4">
        <Badge className={`${planoColors[empresa.plano]} border-0 capitalize`}>{empresa.plano}</Badge>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge className={`${statusColors[empresa.status]} border-0 capitalize`}>{empresa.status}</Badge>
      </td>

      {/* Usuários */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-4 h-4 text-primary/60" />
          <span className="text-sm font-medium text-foreground">{empresa.total_usuarios}</span>
        </div>
      </td>

      {/* Vagas */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <Briefcase className="w-4 h-4 text-primary/60" />
          <span className="text-sm font-medium text-foreground">{empresa.total_vagas}</span>
        </div>
      </td>

      {/* Candidatos */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary/60" />
          <span className="text-sm font-medium text-foreground">{empresa.total_candidatos}</span>
        </div>
      </td>

      {/* Ações */}
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <ActionMenu
          empresa={empresa}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}
