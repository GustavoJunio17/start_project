'use client'

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
    <div className="rounded-xl border border-[#1e2a5e] bg-[#0A0E27] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header Sticky */}
          <thead className="sticky top-0 bg-[#111633] border-b border-[#1e2a5e]">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-[#1e2a5e] bg-[#0A0E27] text-[#00D4FF] focus:ring-[#00D4FF]/50 focus:ring-offset-0 cursor-pointer transition-all"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Empresa</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">CNPJ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Plano</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                <Users className="w-4 h-4 inline" />
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                <Briefcase className="w-4 h-4 inline" />
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                <MessageSquare className="w-4 h-4 inline" />
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white">Ações</th>
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
