'use client'

import { MoreHorizontal, Eye, Edit2, Power, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Empresa } from './types'

interface ActionMenuProps {
  empresa: Empresa
  onView: (empresa: Empresa) => void
  onEdit: (empresa: Empresa) => void
  onToggleStatus: (empresa: Empresa) => void
  onDelete: (empresa: Empresa) => void
}

export function ActionMenu({
  empresa,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-background cursor-pointer transition-colors" onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Abrir menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <DropdownMenuItem onClick={() => onView(empresa)} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          <span>Ver detalhes</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(empresa)} className="cursor-pointer">
          <Edit2 className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          onClick={() => onToggleStatus(empresa)}
          className="cursor-pointer text-muted-foreground"
        >
          <Power className="mr-2 h-4 w-4" />
          <span>{empresa.status === 'ativa' ? 'Desativar' : 'Ativar'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onDelete(empresa)} className="cursor-pointer text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
