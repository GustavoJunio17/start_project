'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Empresa } from '@/components/admin/empresas/types'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email_contato: '',
    segmento: '',
    plano: 'starter',
    status: 'ativa',
  })

  const empresaId = Array.isArray(params.id) ? params.id[0] : params.id

  // Verificar permissão
  if (!authLoading && (!user || (user.role !== 'super_admin' && user.role !== 'super_gestor'))) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
        Apenas super_admin e super_gestor podem acessar esta página
      </div>
    )
  }

  // Carregar empresa
  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/empresas/${empresaId}`)
        const { success, data, error } = await response.json()

        if (!success) {
          toast.error(error || 'Erro ao carregar empresa')
          router.push('/admin/empresas')
          return
        }

        setEmpresa(data)
        setForm({
          nome: data.nome,
          email_contato: data.email_contato || '',
          segmento: data.segmento || '',
          plano: data.plano || 'starter',
          status: data.status || 'ativa',
        })
      } catch (err) {
        toast.error('Erro ao carregar empresa')
        router.push('/admin/empresas')
      } finally {
        setLoading(false)
      }
    }

    if (user && empresaId) {
      carregar()
    }
  }, [user, empresaId, router])

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast.error('Nome da empresa é obrigatório')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/empresas/${empresaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: form.nome,
          email_contato: form.email_contato,
          segmento: form.segmento,
          plano: form.plano,
          status: form.status,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar')
      }

      toast.success('Empresa atualizada com sucesso')
      router.push('/admin/empresas')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar empresa'
      )
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        Carregando...
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
        Empresa não encontrada
      </div>
    )
  }

  const segmentos = [
    'Tecnologia',
    'Saúde',
    'Educação',
    'Varejo',
    'Serviços',
    'Manufatura',
    'Financeiro',
    'Imóvel',
    'Agronegócio',
    'Outros',
  ]

  const planos = [
    { value: 'free', label: 'Free' },
    { value: 'starter', label: 'Starter' },
    { value: 'profissional', label: 'Profissional' },
    { value: 'enterprise', label: 'Enterprise' },
  ]

  const statuses = [
    { value: 'ativa', label: 'Ativa' },
    { value: 'inativa', label: 'Inativa' },
    { value: 'trial', label: 'Trial' },
    { value: 'bloqueada', label: 'Bloqueada' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/empresas')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Empresa</h1>
          <p className="text-muted-foreground">{empresa.nome}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Nome */}
        <div>
          <label className="text-sm font-medium mb-2 block">Nome da Empresa</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* CNPJ (read-only) */}
        <div>
          <label className="text-sm font-medium mb-2 block">CNPJ</label>
          <input
            type="text"
            value={empresa.cnpj || ''}
            disabled
            className="w-full px-3 py-2 border border-border rounded-lg bg-muted opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">CNPJ não pode ser alterado</p>
        </div>

        {/* Email Contato */}
        <div>
          <label className="text-sm font-medium mb-2 block">Email de Contato</label>
          <input
            type="email"
            value={form.email_contato}
            onChange={(e) => setForm({ ...form, email_contato: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Segmento */}
        <div>
          <label className="text-sm font-medium mb-2 block">Segmento</label>
          <select
            value={form.segmento}
            onChange={(e) => setForm({ ...form, segmento: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecionar segmento...</option>
            {segmentos.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>

        {/* Plano */}
        <div>
          <label className="text-sm font-medium mb-2 block">Plano</label>
          <select
            value={form.plano}
            onChange={(e) => setForm({ ...form, plano: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {planos.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/empresas')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
