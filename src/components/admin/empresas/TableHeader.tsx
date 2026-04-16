'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface TableHeaderProps {
  selectedCount: number
}

export function TableHeader({ selectedCount }: TableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selecionada${selectedCount > 1 ? 's' : ''}` : 'Gerencie todas as suas empresas'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/admin/empresas/novo">
          <Button className="gap-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:opacity-90">
            <Plus className="w-4 h-4" />
            Nova Empresa
          </Button>
        </Link>
      </div>
    </div>
  )
}
