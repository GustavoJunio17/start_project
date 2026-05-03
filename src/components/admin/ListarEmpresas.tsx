'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Empresa, Filters, Stats } from './empresas/types'
import { StatCard } from './empresas/StatCard'
import { FilterPanel } from './empresas/FilterPanel'
import { CompanyTable } from './empresas/CompanyTable'
import { CompanyDrawer } from './empresas/CompanyDrawer'
import { EmptyState } from './empresas/EmptyState'
import { TableSkeleton } from './empresas/TableSkeleton'
import { TableHeader } from './empresas/TableHeader'
import { BarChart3, Users, TrendingUp, Zap } from 'lucide-react'

export function ListarEmpresas() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Estado de filtros
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    plano: '',
    segmento: '',
  })

  // Estado de seleção
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Estado do drawer
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Carregar empresas
  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/empresas-list')
        const { success, data, error } = await response.json()

        if (!success) {
          setErro(error || 'Erro ao carregar empresas')
          return
        }

        setEmpresas(data)
        setErro(null)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      carregar()
    }
  }, [user])

  // Calcular stats
  const stats: Stats = useMemo(() => {
    return {
      total: empresas.length,
      ativas: empresas.filter((e) => e.status === 'ativa').length,
      trial: empresas.filter((e) => e.status === 'trial').length,
      receita_estimada: 0,
    }
  }, [empresas])

  // Filtrar empresas
  const empresasFiltradas = useMemo(() => {
    return empresas.filter((empresa) => {
      const matchSearch =
        !filters.search ||
        empresa.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        empresa.cnpj?.includes(filters.search.toLowerCase())

      const matchStatus = !filters.status || empresa.status === filters.status

      const matchPlano = !filters.plano || empresa.plano === filters.plano

      const matchSegmento = !filters.segmento || empresa.segmento === filters.segmento

      return matchSearch && matchStatus && matchPlano && matchSegmento
    })
  }, [empresas, filters])

  // Handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(empresasFiltradas.map((e) => e.id)))
      } else {
        setSelectedIds(new Set())
      }
    },
    [empresasFiltradas]
  )

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleView = useCallback((empresa: Empresa) => {
    setSelectedEmpresa(empresa)
    setDrawerOpen(true)
  }, [])

  const handleEdit = useCallback((empresa: Empresa) => {
    // Navegar para página de edição
    router.push(`/admin/empresas/${empresa.id}/editar`)
  }, [router])

  const handleToggleStatus = useCallback(
    async (empresa: Empresa) => {
      try {
        setActionLoading(empresa.id)
        const novoStatus = empresa.status === 'ativa' ? 'inativa' : 'ativa'
        
        const response = await fetch(`/api/admin/empresas/${empresa.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: novoStatus }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao atualizar status')
        }

        // Atualizar lista local
        setEmpresas((prev) =>
          prev.map((e) =>
            e.id === empresa.id ? { ...e, status: novoStatus } : e
          )
        )

        toast.success(
          `${empresa.nome} ${novoStatus === 'ativa' ? 'ativada' : 'desativada'} com sucesso`
        )
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Erro ao atualizar status'
        )
      } finally {
        setActionLoading(null)
      }
    },
    []
  )

  const handleDelete = useCallback(
    async (empresa: Empresa) => {
      const confirmed = window.confirm(`Tem certeza que deseja deletar ${empresa.nome}?`)
      if (!confirmed) return

      try {
        setActionLoading(empresa.id)
        const response = await fetch(`/api/admin/empresas/${empresa.id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao deletar empresa')
        }

        // Remover da lista local
        setEmpresas((prev) => prev.filter((e) => e.id !== empresa.id))
        setDrawerOpen(false)

        toast.success(`${empresa.nome} deletada com sucesso`)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Erro ao deletar empresa'
        )
      } finally {
        setActionLoading(null)
      }
    },
    []
  )


  const activeFiltersCount = Object.values(filters).filter((v) => v !== '').length

  if (authLoading) {
    return <div className="p-8 text-center text-gray-400">Carregando...</div>
  }

  if (!user || (user.role !== 'super_admin' && user.role !== 'super_gestor')) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
        Apenas super_admin e super_gestor podem acessar esta página
      </div>
    )
  }

  if (erro) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
        {erro}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <TableHeader selectedCount={selectedIds.size} />

      {/* Stats Cards */}
      {!loading && empresas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Empresas"
            value={stats.total}
            icon={<BarChart3 className="w-5 h-5" />}
            trend={{ value: 12, direction: 'up' }}
          />
          <StatCard
            title="Empresas Ativas"
            value={stats.ativas}
            icon={<Zap className="w-5 h-5" />}
            trend={{ value: 8, direction: 'up' }}
          />
          <StatCard
            title="Em Trial"
            value={stats.trial}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Total de Usuários"
            value={empresas.reduce((acc, e) => acc + e.total_usuarios, 0)}
            icon={<Users className="w-5 h-5" />}
            trend={{ value: 5, direction: 'up' }}
          />
        </div>
      )}

      {/* Filtros */}
      {!loading && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {/* Tabela ou estados */}
      {loading ? (
        <TableSkeleton />
      ) : empresasFiltradas.length === 0 && empresas.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="Nenhuma empresa cadastrada"
          description="Comece criando sua primeira empresa no sistema"
          cta={{ label: 'Criar Empresa', href: '/admin/empresas/novo' }}
        />
      ) : empresasFiltradas.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Nenhum resultado encontrado"
          description="Tente ajustar seus filtros de busca"
        />
      ) : (
        <CompanyTable
          empresas={empresasFiltradas}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Drawer */}
      <CompanyDrawer
        empresa={selectedEmpresa}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
    </div>
  )
}
