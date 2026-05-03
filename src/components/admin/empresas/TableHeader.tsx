'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

interface TableHeaderProps {
  selectedCount: number
}

export function TableHeader({ selectedCount }: TableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Empresas</h1>
        <p className="mt-1 text-sm text-gray-400">
          {selectedCount > 0 ? `${selectedCount} selecionada${selectedCount > 1 ? 's' : ''}` : 'Gerencie todas as suas empresas'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/admin/empresas/novo">
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
            <Plus className="w-4 h-4" />
            Nova Empresa
          </button>
        </Link>
      </div>
    </div>
  )
}
