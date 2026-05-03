'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash, MoreHorizontal } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const supabase = createClient()

interface CargoOuDepartamento {
  id: string; empresa_id: string; tipo: 'cargo' | 'departamento'; nome: string
  descricao: string | null; ativo: boolean; created_at: string; departamento_id?: string | null
}

export default function CargosDepartamentosPage() {
  const { user } = useAuth()
  const [cargos, setCargos] = useState<CargoOuDepartamento[]>([])
  const [departamentos, setDepartamentos] = useState<CargoOuDepartamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'cargo' | 'departamento'>('cargo')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '', departamento_id: '' })
  const [submitting, setSubmitting] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user?.empresa_id) return
    setLoading(true)
    const { data } = await supabase.from('cargos_departamentos').select('*').eq('empresa_id', user.empresa_id).order('nome')
    if (data) {
      setCargos(data.filter(d => d.tipo === 'cargo'))
      setDepartamentos(data.filter(d => d.tipo === 'departamento'))
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user?.empresa_id])

  const handleOpenForm = (item?: CargoOuDepartamento) => {
    if (item) { setEditingId(item.id); setFormData({ nome: item.nome, descricao: item.descricao || '', departamento_id: item.departamento_id || '' }) }
    else { setEditingId(null); setFormData({ nome: '', descricao: '', departamento_id: '' }) }
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.empresa_id || !formData.nome.trim()) return
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = { empresa_id: user.empresa_id, tipo: tab, nome: formData.nome.trim(), descricao: formData.descricao?.trim() || null, ativo: true }
      if (tab === 'cargo') payload.departamento_id = formData.departamento_id || null
      let error
      if (editingId) { ;({ error } = await supabase.from('cargos_departamentos').update(payload).eq('id', editingId)) }
      else { ;({ error } = await supabase.from('cargos_departamentos').insert([payload])) }
      if (error) throw error
      setIsFormOpen(false); fetchData()
    } catch (error: any) { toast.error('Erro ao salvar: ' + (error?.message || 'tente novamente')) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    const { error } = await supabase.from('cargos_departamentos').delete().eq('id', id)
    if (error) toast.error('Erro ao excluir: ' + error.message)
    else fetchData()
  }

  const handleToggleActive = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from('cargos_departamentos').update({ ativo: !ativo }).eq('id', id)
    if (error) toast.error('Erro ao atualizar status')
    else fetchData()
  }

  const items = tab === 'cargo' ? cargos : departamentos
  const filtered = items.filter(item => item.nome.toLowerCase().includes(search.toLowerCase()))
  const nomeAbrev = tab === 'cargo' ? 'Cargo' : 'Departamento'
  const nomePlural = tab === 'cargo' ? 'Cargos' : 'Departamentos'
  const inputClass = "w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors"

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cargos e Departamentos</h1>
        <p className="text-gray-400 mt-1">Gerencie os cargos e departamentos da sua empresa</p>
      </div>

      <div className="flex gap-1 p-1 bg-[#111633] border border-[#1e2a5e] rounded-lg w-fit">
        {(['cargo', 'departamento'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
            {t === 'cargo' ? 'Cargos' : 'Departamentos'}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input placeholder={`Buscar ${nomePlural.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF]/50 transition-colors" />
        </div>
        <button onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Novo {nomeAbrev}
        </button>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              {[nomeAbrev, 'Descrição', 'Status', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhum {nomeAbrev.toLowerCase()} cadastrado</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-4 py-3.5 font-medium text-white">{item.nome}</td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{item.descricao || '-'}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => handleToggleActive(item.id, item.ativo)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${item.ativo ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-gray-500/20'}`}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <div className="relative">
                    <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-8 z-10 min-w-[120px] bg-[#0A0E27] border border-[#1e2a5e] rounded-lg shadow-lg overflow-hidden">
                        <button onClick={() => { handleOpenForm(item); setOpenMenuId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => { handleDelete(item.id); setOpenMenuId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
                          <Trash className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#0A0E27] border-[#1e2a5e] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">{editingId ? `Editar ${nomeAbrev}` : `Novo ${nomeAbrev}`}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingId ? `Atualize os dados do ${nomeAbrev.toLowerCase()}.` : `Adicione um novo ${nomeAbrev.toLowerCase()} à sua empresa.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Nome</label>
              <input value={formData.nome} onChange={e => setFormData(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Desenvolvedor, TI, Financeiro..." required className={inputClass} />
            </div>
            {tab === 'cargo' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Departamento <span className="text-gray-500 font-normal">(obrigatório)</span></label>
                <select value={formData.departamento_id} onChange={e => setFormData(f => ({ ...f, departamento_id: e.target.value }))} required
                  className="w-full px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-colors">
                  <option value="">Selecione um departamento</option>
                  {departamentos.map(dept => <option key={dept.id} value={dept.id}>{dept.nome}</option>)}
                </select>
                {departamentos.length === 0 && <p className="text-xs text-[#F59E0B]">Nenhum departamento cadastrado. Crie um departamento primeiro.</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Descrição (opcional)</label>
              <textarea value={formData.descricao} onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva este cargo ou departamento" rows={3}
                className={`${inputClass} resize-none`} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsFormOpen(false)} disabled={submitting}
                className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
