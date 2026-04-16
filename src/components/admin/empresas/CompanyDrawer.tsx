'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Empresa } from './types'
import {
  Building2,
  Users,
  Briefcase,
  MessageSquare,
  Calendar,
  Link as LinkIcon,
  Mail,
  Edit2,
  Power,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CompanyDrawerProps {
  empresa: Empresa | null
  isOpen: boolean
  onClose: () => void
  onEdit: (empresa: Empresa) => void
  onToggleStatus: (empresa: Empresa) => void
  onDelete: (empresa: Empresa) => void
}

const statusColors: Record<string, string> = {
  ativa: 'bg-success/20 text-success',
  inativa: 'bg-muted/50 text-muted-foreground',
  trial: 'bg-amber-500/20 text-amber-600',
  bloqueada: 'bg-destructive/20 text-destructive',
}

const planoNomes: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Iniciante',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
}

export function CompanyDrawer({
  empresa,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: CompanyDrawerProps) {
  if (!empresa) return null

  const dataFormatada = formatDistanceToNow(new Date(empresa.data_cadastro), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-96 bg-card border-border p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-lg">{empresa.nome}</SheetTitle>
                <p className="text-xs text-muted-foreground truncate">{empresa.segmento}</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Status e Plano */}
          <div className="flex gap-3">
            <Badge className={`${statusColors[empresa.status]} border-0 capitalize`}>{empresa.status}</Badge>
            <Badge className="bg-primary/20 text-primary border-0 capitalize">{planoNomes[empresa.plano]}</Badge>
          </div>

          <Separator className="bg-border/50" />

          {/* Informações */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">CNPJ</p>
              <p className="text-sm font-mono text-foreground">{empresa.cnpj || '-'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Email de Contato</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary/60" />
                <a href={`mailto:${empresa.email_contato}`} className="text-sm text-primary hover:underline">
                  {empresa.email_contato || '-'}
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Cadastro</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary/60" />
                <p className="text-sm text-foreground">{dataFormatada}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Métricas */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Métricas</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background rounded-lg p-3 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-primary/60" />
                </div>
                <p className="text-sm font-semibold text-foreground">{empresa.total_usuarios}</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>

              <div className="bg-background rounded-lg p-3 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Briefcase className="w-3 h-3 text-primary/60" />
                </div>
                <p className="text-sm font-semibold text-foreground">{empresa.total_vagas}</p>
                <p className="text-xs text-muted-foreground">Vagas</p>
              </div>

              <div className="bg-background rounded-lg p-3 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3 text-primary/60" />
                </div>
                <p className="text-sm font-semibold text-foreground">{empresa.total_candidatos}</p>
                <p className="text-xs text-muted-foreground">Candidatos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <Separator className="bg-border/50" />
        <div className="px-6 py-4 space-y-2">
          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-background"
            onClick={() => {
              onEdit(empresa)
              onClose()
            }}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>

          <Button
            variant="outline"
            className="w-full border-border text-muted-foreground"
            onClick={() => {
              onToggleStatus(empresa)
              onClose()
            }}
          >
            <Power className="w-4 h-4 mr-2" />
            {empresa.status === 'ativa' ? 'Desativar' : 'Ativar'}
          </Button>

          <Button
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => {
              onDelete(empresa)
              onClose()
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
