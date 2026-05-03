"use client"


import { Filters } from './types'
import { X, Search } from 'lucide-react'

interface FilterPanelProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  activeFiltersCount: number
}

const SEGMENTOS = [
  'Tecnologia',
  'Saúde',
  'Educação',
  'Varejo',
  'Serviços',
  'Manufatura',
  'Financeiro',
  'Outros',
]

export function FilterPanel({ filters, onFiltersChange, activeFiltersCount }: FilterPanelProps) {
  const handleChange = (key: keyof Filters, value: string | null) => {
    onFiltersChange({ ...filters, [key]: value ?? '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Filtros em grid (lado direito) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:flex-shrink-0 md:w-auto w-full mt-4 md:mt-0">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Status</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#111633] text-gray-300">Todos</option>
                <option value="ativa" className="bg-[#111633] text-gray-300">Ativa</option>
                <option value="inativa" className="bg-[#111633] text-gray-300">Inativa</option>
                <option value="trial" className="bg-[#111633] text-gray-300">Trial</option>
                <option value="bloqueada" className="bg-[#111633] text-gray-300">Bloqueada</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Plano</label>
            <div className="relative">
              <select
                value={filters.plano}
                onChange={(e) => handleChange('plano', e.target.value)}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#111633] text-gray-300">Todos</option>
                <option value="free" className="bg-[#111633] text-gray-300">Free</option>
                <option value="starter" className="bg-[#111633] text-gray-300">Starter</option>
                <option value="profissional" className="bg-[#111633] text-gray-300">Profissional</option>
                <option value="enterprise" className="bg-[#111633] text-gray-300">Enterprise</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Segmento</label>
            <div className="relative">
              <select
                value={filters.segmento}
                onChange={(e) => handleChange('segmento', e.target.value)}
                className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#111633] text-gray-300">Todos</option>
                {SEGMENTOS.map((s) => (
                  <option key={s} value={s} className="bg-[#111633] text-gray-300">
                    {s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            {activeFiltersCount > 0 ? (
              <button
                onClick={() =>
                  onFiltersChange({
                    search: '',
                    status: '',
                    plano: '',
                    segmento: '',
                  })
                }
                className="w-full h-[42px] flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-xs font-medium transition-all"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar ({activeFiltersCount})
              </button>
            ) : (
              <div className="w-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
