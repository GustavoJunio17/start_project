'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Empresa } from './types'
import { CompanyRow } from './CompanyRow'
import { Users, Briefcase, MessageSquare } from 'lucide-react'

interface CompanyTableProps {
  empresas: Empresa[]
  selectedIds: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string) => void
  onView: (empresa: Empresa) => void
  onEdit: (empresa: Empresa) => void
  onToggleStatus: (empresa: Empresa) => void
  onDelete: (empresa: Empresa) => void
}

export function CompanyTable({
  empresas,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: CompanyTableProps) {
  const allSelected = empresas.length > 0 && selectedIds.size === empresas.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < empresas.length

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header Sticky */}
          <thead className="sticky top-0 bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={onSelectAll}
                  className="bg-background border-border"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Empresa</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CNPJ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Plano</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                <Users className="w-4 h-4 inline" />
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                <Briefcase className="w-4 h-4 inline" />
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                <MessageSquare className="w-4 h-4 inline" />
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Ações</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {empresas.map((empresa) => (
              <CompanyRow
                key={empresa.id}
                empresa={empresa}
                isSelected={selectedIds.has(empresa.id)}
                onSelect={onSelectOne}
                onView={onView}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
