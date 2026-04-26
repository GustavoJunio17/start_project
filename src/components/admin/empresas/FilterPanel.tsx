"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-10 bg-background border-border w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
        </div>

        {/* Filtros em grid (lado direito) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:flex-shrink-0 md:w-auto w-full">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Status</label>
            <Select value={filters.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="bloqueada">Bloqueada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Plano</label>
            <Select value={filters.plano} onValueChange={(v) => handleChange('plano', v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Segmento</label>
            <Select value={filters.segmento} onValueChange={(v) => handleChange('segmento', v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {SEGMENTOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            {activeFiltersCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onFiltersChange({
                    search: '',
                    status: '',
                    plano: '',
                    segmento: '',
                  })
                }
                className="w-full text-xs border-border"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar ({activeFiltersCount})
              </Button>
            ) : (
              <div className="w-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
