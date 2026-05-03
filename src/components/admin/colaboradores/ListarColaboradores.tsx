"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/db/client"
import { MoreHorizontal, Edit, Trash, Plus, Search, Building2, Mail, Phone, Briefcase, GraduationCap, Calendar, User, CreditCard, ClipboardList, Copy, CheckCheck, ExternalLink, X } from "lucide-react"
import type { Colaborador, Empresa, TemplateTeste } from "@/types/database"
import { FormColaborador } from "./FormColaborador"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 20

export function ListarColaboradores() {
  const [colaboradores, setColaboradores] = useState<(Colaborador & { empresa: { nome: string } })[]>([])
  const [empresas, setEmpresas] = useState<Pick<Empresa, 'id' | 'nome'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [empresaFilter, setEmpresaFilter] = useState<string>('todas')
  const supabase = createClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [colabToEdit, setColabToEdit] = useState<Colaborador | null>(null)
  const [colabDetalhes, setColabDetalhes] = useState<(Colaborador & { empresa: { nome: string } }) | null>(null)
  const [page, setPage] = useState(1)

  const [discModalColab, setDiscModalColab] = useState<Colaborador | null>(null)
  const [templates, setTemplates] = useState<TemplateTeste[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [gerandoLink, setGerandoLink] = useState(false)
  const [linkGerado, setLinkGerado] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [colsRes, empresasRes, templatesRes] = await Promise.all([
      supabase.from('colaboradores').select('*, empresa:empresas(nome)').order('nome'),
      supabase.from('empresas').select('id, nome').order('nome'),
      supabase.from('templates_testes').select('id, nome').order('nome'),
    ])
    setColaboradores(colsRes.data || [])
    setEmpresas(empresasRes.data || [])
    setTemplates(templatesRes.data || [])
    setLoading(false)
  }

  const abrirModalDisc = (colab: Colaborador) => {
    setDiscModalColab(colab)
    setSelectedTemplate('')
    setLinkGerado(null)
    setCopiado(false)
  }

  const gerarLinkDisc = async () => {
    if (!discModalColab || !selectedTemplate) return
    setGerandoLink(true)
    try {
      const res = await fetch(`/api/colaboradores/${discModalColab.id}/gerar-teste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: selectedTemplate }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Erro ao gerar link'); return }
      setLinkGerado(data.link)
    } catch {
      alert('Erro ao gerar link')
    } finally {
      setGerandoLink(false)
    }
  }

  const copiarLink = () => {
    if (!linkGerado) return
    navigator.clipboard.writeText(linkGerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return
    
    const { error } = await supabase.from('colaboradores').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir colaborador: ' + error.message)
      return
    }
    fetchData()
  }

  const filteredColabs = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase()) || 
                          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter
    const matchesEmpresa = empresaFilter === 'todas' || c.empresa_id === empresaFilter

    return matchesSearch && matchesStatus && matchesEmpresa
  })

  const totalPages = Math.ceil(filteredColabs.length / ITEMS_PER_PAGE)
  const paginatedColabs = filteredColabs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => setPage(1), [search, statusFilter, empresaFilter])

  const STATUS_STYLES: Record<string, string> = {
    ativo: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    em_treinamento: 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20',
    desligado: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'ativo': return 'Ativo'
      case 'em_treinamento': return 'Em Treinamento'
      case 'desligado': return 'Desligado'
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="relative w-full xl:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full bg-[#111633] border border-[#1e2a5e] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
          <div className="relative">
            <select 
              value={empresaFilter} 
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="w-[200px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todas" className="text-gray-300">Todas as Empresas</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id} className="text-white">
                  {empresa.nome}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[160px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="todos" className="text-gray-300">Todos Status</option>
              <option value="ativo" className="text-white">Ativo</option>
              <option value="em_treinamento" className="text-white">Em Treinamento</option>
              <option value="desligado" className="text-white">Desligado</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <button onClick={() => { setColabToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all shrink-0">
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a5e]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Colaborador</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cargo / Função</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contratação</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[80px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">Carregando colaboradores...</td>
              </tr>
            ) : filteredColabs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">Nenhum colaborador encontrado.</td>
              </tr>
            ) : paginatedColabs.map(colab => (
              <tr
                key={colab.id}
                className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0 cursor-pointer"
                onClick={() => setColabDetalhes(colab)}
              >
                <td className="px-4 py-3.5">
                  <div className="font-medium text-white">{colab.nome}</div>
                  <div className="text-xs text-gray-500">{colab.email || '-'}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-sm text-gray-400">{colab.empresa?.nome || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{colab.cargo || '-'}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[colab.status] || 'bg-gray-500/10 text-gray-400'}`}>
                    {getStatusLabel(colab.status)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-500">
                  {colab.data_contratacao ? new Date(colab.data_contratacao).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setColabToEdit(colab); setIsFormOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1e2a5e]/50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); abrirModalDisc(colab); }}
                      className="p-1.5 text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors"
                      title="Aplicar Teste DISC"
                    >
                      <ClipboardList className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(colab.id); }}
                      className="p-1.5 text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredColabs.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {isFormOpen && (
        <FormColaborador
          colaborador={colabToEdit}
          empresas={empresas}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); fetchData(); }}
        />
      )}

      {/* Modal: Aplicar Teste DISC */}
      {!!discModalColab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-[#1e2a5e]">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#00D4FF]" />
                Aplicar Teste DISC
              </h2>
              <button onClick={() => setDiscModalColab(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111633] border border-[#1e2a5e]">
                <div className="w-9 h-9 rounded-full bg-[#00D4FF]/15 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-[#00D4FF]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{discModalColab.nome}</p>
                  <p className="text-xs text-gray-400">{discModalColab.cargo || 'Sem cargo'}</p>
                </div>
              </div>

              {!linkGerado ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Selecione o template de teste</p>
                    {templates.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Nenhum template cadastrado. Crie um em <strong className="text-white">Testes</strong>.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                        {templates.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTemplate(t.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                              selectedTemplate === t.id
                                ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-white'
                                : 'border-[#1e2a5e] bg-[#111633] text-gray-300 hover:border-[#1e2a5e]/80 hover:bg-[#1e2a5e]/50'
                            }`}
                          >
                            <p className="font-medium">{t.nome}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      !selectedTemplate || gerandoLink 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:opacity-90 hover:-translate-y-0.5'
                    }`}
                    disabled={!selectedTemplate || gerandoLink}
                    onClick={gerarLinkDisc}
                  >
                    {gerandoLink ? 'Gerando...' : 'Gerar Link do Teste'}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-sm text-[#10B981]">
                    Link gerado! Compartilhe com <strong className="text-white">{discModalColab.nome}</strong>.
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400">Link do teste</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#111633] rounded-lg px-3 py-2 text-xs font-mono truncate text-gray-300 border border-[#1e2a5e]">
                        {linkGerado}
                      </div>
                      <button onClick={copiarLink} className="p-2 border border-[#1e2a5e] text-gray-300 rounded-lg hover:bg-[#1e2a5e]/50 hover:text-white transition-colors shrink-0">
                        {copiado ? <CheckCheck className="h-4 w-4 text-[#10B981]" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        className="p-2 border border-[#1e2a5e] text-gray-300 rounded-lg hover:bg-[#1e2a5e]/50 hover:text-white transition-colors shrink-0"
                        onClick={() => window.open(linkGerado!, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                    onClick={() => { setLinkGerado(null); setSelectedTemplate('') }}
                  >
                    Gerar novo link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Colaborador */}
      {!!colabDetalhes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-[760px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-5 border-b border-[#1e2a5e]">
              <div>
                <h2 className="text-xl font-semibold text-white">{colabDetalhes.nome}</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {[colabDetalhes.cargo, colabDetalhes.empresa?.nome].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[colabDetalhes.status] || 'bg-gray-500/10 text-gray-400'}`}>
                  {getStatusLabel(colabDetalhes.status)}
                </span>
                <button onClick={() => setColabDetalhes(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Contato */}
              <Section title="Contato">
                <div className="grid grid-cols-3 gap-3">
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={colabDetalhes.email} fullWidth />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefone" value={colabDetalhes.telefone} />
                  <InfoRow icon={<CreditCard className="h-4 w-4" />} label="CPF" value={colabDetalhes.cpf} />
                </div>
              </Section>

              {/* Cargo */}
              <Section title="Cargo & Posição">
                <div className="grid grid-cols-3 gap-3">
                  <InfoRow icon={<Building2 className="h-4 w-4" />} label="Empresa" value={colabDetalhes.empresa?.nome} />
                  <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Cargo" value={colabDetalhes.cargo} />
                  <InfoRow icon={<User className="h-4 w-4" />} label="Departamento" value={colabDetalhes.departamento} />
                  <InfoRow icon={<User className="h-4 w-4" />} label="Nível" value={colabDetalhes.nivel} />
                  <InfoRow icon={<GraduationCap className="h-4 w-4" />} label="Escolaridade" value={colabDetalhes.escolaridade} />
                  <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Regime" value={colabDetalhes.regime_contrato} />
                  <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Modelo" value={colabDetalhes.modelo_trabalho} />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Contratação"
                    value={colabDetalhes.data_contratacao ? new Date(colabDetalhes.data_contratacao).toLocaleDateString('pt-BR') : undefined}
                  />
                  {colabDetalhes.salario != null && (
                    <InfoRow
                      icon={<CreditCard className="h-4 w-4" />}
                      label="Salário"
                      value={colabDetalhes.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    />
                  )}
                </div>
              </Section>

              {/* Hard Skills */}
              {colabDetalhes.hard_skills && colabDetalhes.hard_skills.length > 0 && (
                <Section title="Hard Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {colabDetalhes.hard_skills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">{skill}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* DISC */}
              {colabDetalhes.perfil_disc && (
                <Section title="Perfil DISC">
                  <div className="grid grid-cols-4 gap-3">
                    {(['D', 'I', 'S', 'C'] as const).map(dim => {
                      const val = colabDetalhes.perfil_disc![dim]
                      const max = 100
                      const dimColors: Record<string, string> = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#0066FF' }
                      return (
                        <div key={dim} className="bg-[#111633] border border-[#1e2a5e] rounded-lg p-3 flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-gray-500">{dim}</span>
                          <span className="text-2xl font-bold" style={{ color: dimColors[dim] }}>{val}</span>
                          <div className="w-full bg-[#1e2a5e] rounded-full h-1.5 mt-1">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${(val / max) * 100}%`, backgroundColor: dimColors[dim] }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Section>
              )}

              <div className="flex justify-end pt-5 border-t border-[#1e2a5e]">
                <button
                  onClick={() => { setColabDetalhes(null); setColabToEdit(colabDetalhes); setIsFormOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all"
                >
                  <Edit className="h-4 w-4" /> Editar Colaborador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#00D4FF]/70 mb-3">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value, fullWidth }: { icon: React.ReactNode; label: string; value?: string | null; fullWidth?: boolean }) {
  if (!value) return null
  return (
    <div className={`flex items-start gap-2 ${fullWidth ? 'col-span-2' : ''}`}>
      <span className="text-gray-500 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="font-medium text-gray-200 truncate">{value}</p>
      </div>
    </div>
  )
}
