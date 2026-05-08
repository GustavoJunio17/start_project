"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/db/client"
import { useCargosEDepartamentos } from "@/hooks/useCargosEDepartamentos"
import type { Colaborador, StatusColaborador, OrigemColaborador, Empresa, EscolaridadeColaborador } from "@/types/database"
import { Eye, EyeOff, RefreshCw, UserCheck } from "lucide-react"
import { formatBRL, centsToFloat, floatToCents } from "@/lib/utils/currency"
import { maskPhone, maskCPF, maskDate } from "@/lib/utils/masks"

interface FormColaboradorProps {
  colaborador: Colaborador | null
  empresas: Pick<Empresa, 'id' | 'nome'>[]
  onClose: () => void
  onSaved: () => void
  userRole?: string
  userId?: string
}

const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  em_treinamento: 'Em Treinamento',
  desligado: 'Desligado',
}

const MODELO_TRABALHO_LABELS: Record<string, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
}

const REGIME_LABELS: Record<string, string> = {
  CLT: 'CLT',
  PJ: 'PJ',
  Estagio: 'Estágio',
  Freelance: 'Freelance',
}

const ESCOLARIDADE_LABELS: Record<string, string> = {
  Medio: 'Médio',
  Superior: 'Superior',
  'Pos-graduado': 'Pós-graduado',
}


function isoToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return ''
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

function displayToISO(display: string): string {
  const d = display.replace(/\D/g, '')
  if (d.length !== 8) return ''
  return `${d.slice(4)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
}

function gerarSenha(nome: string): string {
  const prefixo = nome.trim().split(' ')[0]
  const capitalizado = prefixo.charAt(0).toUpperCase() + prefixo.slice(1, 4).toLowerCase()
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${capitalizado}@${num}`
}

export function FormColaborador({ colaborador, empresas, onClose, onSaved, userRole, userId }: FormColaboradorProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const isSuperRole = userRole === 'super_admin' || userRole === 'super_gestor'
  const empresaId = colaborador?.empresa_id || (isSuperRole ? '' : (empresas.length > 0 ? empresas[0].id : ''))
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(empresaId)
  const { cargos, departamentos, loading: cargosDeptLoading } = useCargosEDepartamentos(selectedEmpresaId, userRole, userId)

  const [formData, setFormData] = useState({
    nome: colaborador?.nome || '',
    email: colaborador?.email || '',
    telefone: colaborador?.telefone ? maskPhone(colaborador.telefone) : '',
    cpf: colaborador?.cpf ? maskCPF(colaborador.cpf) : '',
    cargo: colaborador?.cargo || '',
    departamento: colaborador?.departamento || '',
    empresa_id: empresaId,
    status: colaborador?.status || 'ativo' as StatusColaborador,
    origem: colaborador?.origem || 'contratacao_direta' as OrigemColaborador,
    data_contratacao: isoToDisplay(colaborador?.data_contratacao?.split('T')[0] || ''),
    modelo_trabalho: colaborador?.modelo_trabalho || '',
    regime_contrato: colaborador?.regime_contrato || '',
    salario: floatToCents(colaborador?.salario),
    hard_skills: colaborador?.hard_skills ? colaborador.hard_skills.join(', ') : '',
    escolaridade: colaborador?.escolaridade || '',
  })

  const [criarConta, setCriarConta] = useState(false)
  const [emailConta, setEmailConta] = useState('')
  const [senhaConta, setSenhaConta] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        email: colaborador.email || '',
        telefone: colaborador.telefone ? maskPhone(colaborador.telefone) : '',
        cpf: colaborador.cpf ? maskCPF(colaborador.cpf) : '',
        cargo: colaborador.cargo || '',
        departamento: colaborador.departamento || '',
        empresa_id: colaborador.empresa_id,
        status: colaborador.status,
        origem: colaborador.origem,
        data_contratacao: isoToDisplay(colaborador.data_contratacao?.split('T')[0] || ''),
        modelo_trabalho: colaborador.modelo_trabalho || '',
        regime_contrato: colaborador.regime_contrato || '',
        salario: floatToCents(colaborador.salario),
        hard_skills: colaborador.hard_skills ? colaborador.hard_skills.join(', ') : '',
        escolaridade: colaborador.escolaridade || '',
      })
    }
  }, [colaborador])

  useEffect(() => {
    if (criarConta && !emailConta) {
      setEmailConta(formData.email)
    }
  }, [criarConta])

  const handleSugerirSenha = () => {
    setSenhaConta(gerarSenha(formData.nome || 'Colaborador'))
    setShowSenha(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!colaborador && criarConta) {
        // Novo colaborador COM criação de conta → chamar API server-side
        const payload = {
          nome: formData.nome,
          email: formData.email || null,
          telefone: formData.telefone || null,
          cpf: formData.cpf || null,
          cargo: formData.cargo || null,
          departamento: formData.departamento || null,
          empresa_id: formData.empresa_id,
          status: formData.status,
          origem: formData.origem,
          data_contratacao: displayToISO(formData.data_contratacao) || null,
          modelo_trabalho: formData.modelo_trabalho || null,
          regime_contrato: formData.regime_contrato || null,
          salario: centsToFloat(formData.salario),
          hard_skills: formData.hard_skills ? formData.hard_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          escolaridade: formData.escolaridade || null,
          criar_conta: true,
          email_conta: emailConta.trim(),
          senha_conta: senhaConta,
        }

        const res = await fetch('/api/empresa/colaboradores/criar-com-conta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || 'Erro ao criar colaborador')
          return
        }

        onSaved()
        return
      }

      // Fluxo sem conta (ou edição) → Supabase direto
      const payload = {
        nome: formData.nome,
        email: formData.email || null,
        telefone: formData.telefone || null,
        cpf: formData.cpf || null,
        cargo: formData.cargo || null,
        departamento: formData.departamento || null,
        empresa_id: formData.empresa_id,
        status: formData.status,
        origem: formData.origem,
        data_contratacao: displayToISO(formData.data_contratacao) || null,
        modelo_trabalho: formData.modelo_trabalho || null,
        regime_contrato: formData.regime_contrato || null,
        salario: formData.salario ? parseFloat(formData.salario) : null,
        hard_skills: formData.hard_skills ? formData.hard_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        escolaridade: formData.escolaridade || null,
      }

      if (colaborador) {
        const { error } = await supabase
          .from('colaboradores')
          .update(payload)
          .eq('id', colaborador.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('colaboradores')
          .insert([payload])

        if (error) throw error
      }
      onSaved()
    } catch (error: any) {
      toast.error('Erro ao salvar colaborador: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedDepartamentoId = departamentos.find(d => d.nome === formData.departamento)?.id ?? ''
  const filteredCargos = selectedDepartamentoId
    ? cargos.filter(c => c.departamento_id === selectedDepartamentoId)
    : cargos

  const handleDepartamentoChange = (val: string | null) => {
    if (!val) return
    setFormData(f => ({ ...f, departamento: val, cargo: '' }))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-2xl xl:max-w-4xl my-8 relative flex flex-col animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#0A0E27] transition-colors"
          >
            ✕
          </button>
          
          <div className="px-6 pt-6 pb-4 border-b border-[#1e2a5e]">
            <h2 className="text-xl font-bold text-white">
              {colaborador ? 'Editar Colaborador' : 'Adicionar Colaborador'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {colaborador ? 'Atualize as informações do colaborador abaixo.' : 'Preencha os dados do novo colaborador na empresa desejada.'}
            </p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Pessoais e Contato */}
              <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl overflow-hidden">
                <div className="bg-[#111633] px-4 py-3 border-b border-[#1e2a5e]">
                  <h3 className="text-sm font-semibold text-white">Informações Pessoais e Contato</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Nome Completo</label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={e => setFormData(f => ({...f, nome: e.target.value}))}
                        placeholder="Maria Souza"
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Email Corporativo</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(f => ({...f, email: e.target.value}))}
                        placeholder="maria@empresa.com"
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Telefone/WhatsApp</label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={e => setFormData(f => ({...f, telefone: maskPhone(e.target.value)}))}
                        placeholder="(11) 99999-9999"
                        inputMode="numeric"
                        maxLength={15}
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">CPF/Documento</label>
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={e => setFormData(f => ({...f, cpf: maskCPF(e.target.value)}))}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        maxLength={14}
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vínculo Profissional */}
              <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl overflow-hidden">
                <div className="bg-[#111633] px-4 py-3 border-b border-[#1e2a5e]">
                  <h3 className="text-sm font-semibold text-white">Vínculo Profissional</h3>
                </div>
                <div className="p-4 space-y-4">
                  {isSuperRole && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Empresa</label>
                      <div className="relative">
                        <select
                          value={formData.empresa_id}
                          onChange={(e) => {
                            const val = e.target.value
                            setFormData(f => ({...f, empresa_id: val, departamento: '', cargo: ''}))
                            setSelectedEmpresaId(val)
                          }}
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-500">Selecione uma empresa</option>
                          {empresas.map(emp => (
                            <option key={emp.id} value={emp.id} className="text-white">{emp.nome}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">
                        Departamento/Setor
                        {!cargosDeptLoading && departamentos.length === 0 && (
                          <span className="text-orange-400 text-xs ml-1">(nenhum cadastrado)</span>
                        )}
                      </label>
                      {cargosDeptLoading ? (
                        <div className="h-[42px] bg-[#111633] rounded-lg border border-[#1e2a5e] animate-pulse" />
                      ) : departamentos.length > 0 ? (
                        <div className="relative">
                          <select
                            value={formData.departamento}
                            onChange={(e) => handleDepartamentoChange(e.target.value)}
                            className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-gray-500">Selecione um departamento</option>
                            {departamentos.map(dept => (
                              <option key={dept.id} value={dept.nome} className="text-white">{dept.nome}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.departamento}
                          onChange={e => setFormData(f => ({...f, departamento: e.target.value}))}
                          placeholder="Engenharia, Design, Financeiro"
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">
                        Cargo / Função
                        {!cargosDeptLoading && filteredCargos.length === 0 && (
                          <span className="text-orange-400 text-xs ml-1">
                            {cargos.length === 0 ? '(nenhum cadastrado)' : '(selecione um departamento)'}
                          </span>
                        )}
                      </label>
                      {cargosDeptLoading ? (
                        <div className="h-[42px] bg-[#111633] rounded-lg border border-[#1e2a5e] animate-pulse" />
                      ) : filteredCargos.length > 0 ? (
                        <div className="relative">
                          <select
                            value={formData.cargo}
                            onChange={(e) => setFormData(f => ({...f, cargo: e.target.value}))}
                            className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-gray-500">Selecione um cargo</option>
                            {filteredCargos.map(cargo => (
                              <option key={cargo.id} value={cargo.nome} className="text-white">{cargo.nome}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.cargo}
                          onChange={e => setFormData(f => ({...f, cargo: e.target.value}))}
                          placeholder="Desenvolvedora"
                          disabled={!!selectedDepartamentoId && cargos.length > 0}
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Status</label>
                      <div className="relative">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(f => ({...f, status: e.target.value as StatusColaborador}))}
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="ativo" className="text-white">Ativo</option>
                          <option value="em_treinamento" className="text-white">Em Treinamento</option>
                          <option value="desligado" className="text-white">Desligado</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Detalhes do Contrato */}
              <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl overflow-hidden">
                <div className="bg-[#111633] px-4 py-3 border-b border-[#1e2a5e]">
                  <h3 className="text-sm font-semibold text-white">Detalhes do Contrato</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Data de Contratação</label>
                      <input
                        type="text"
                        value={formData.data_contratacao}
                        onChange={e => setFormData(f => ({...f, data_contratacao: maskDate(e.target.value)}))}
                        placeholder="DD/MM/AAAA"
                        inputMode="numeric"
                        maxLength={10}
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Modelo de Trabalho</label>
                      <div className="relative">
                        <select
                          value={formData.modelo_trabalho}
                          onChange={(e) => setFormData(f => ({...f, modelo_trabalho: e.target.value}))}
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-500">Selecione</option>
                          <option value="remoto" className="text-white">Remoto</option>
                          <option value="hibrido" className="text-white">Híbrido</option>
                          <option value="presencial" className="text-white">Presencial</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Regime de Contratação</label>
                      <div className="relative">
                        <select
                          value={formData.regime_contrato}
                          onChange={(e) => setFormData(f => ({...f, regime_contrato: e.target.value}))}
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-500">Selecione</option>
                          <option value="CLT" className="text-white">CLT</option>
                          <option value="PJ" className="text-white">PJ</option>
                          <option value="Estagio" className="text-white">Estágio</option>
                          <option value="Freelance" className="text-white">Freelance</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Salário / Remuneração</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatBRL(formData.salario)}
                        onChange={e => setFormData(f => ({...f, salario: e.target.value.replace(/\D/g, '')}))}
                        placeholder="R$ 0,00"
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Técnicas */}
              <div className="bg-[#0A0E27] border border-[#1e2a5e] rounded-xl overflow-hidden">
                <div className="bg-[#111633] px-4 py-3 border-b border-[#1e2a5e] flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Informações Técnicas</h3>
                  <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-[#0A0E27] border border-[#1e2a5e]">Opcional</span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400">Hard Skills (Tecnologias)</label>
                    <textarea
                      value={formData.hard_skills}
                      onChange={e => setFormData(f => ({...f, hard_skills: e.target.value}))}
                      placeholder="Ex: React, Node.js, TypeScript (separe por vírgula)"
                      className="w-full min-h-[80px] bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400">Escolaridade</label>
                    <div className="relative">
                      <select
                        value={formData.escolaridade}
                        onChange={(e) => setFormData(f => ({...f, escolaridade: e.target.value as EscolaridadeColaborador}))}
                        className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-gray-500">Selecione</option>
                        <option value="Medio" className="text-white">Médio</option>
                        <option value="Superior" className="text-white">Superior</option>
                        <option value="Pos-graduado" className="text-white">Pós-graduado</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acesso ao Sistema — apenas para novos colaboradores */}
              {!colaborador && (
                <div className="bg-[#0A0E27] border border-[#1e2a5e] border-dashed rounded-xl overflow-hidden">
                  <div className="px-4 py-4 flex items-center justify-between border-b border-[#1e2a5e]/50">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#00D4FF]" />
                        Acesso ao Sistema
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Cria uma conta para o colaborador acessar o painel como funcionário
                      </p>
                    </div>
                    {/* Custom Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => setCriarConta(!criarConta)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${criarConta ? 'bg-[#00D4FF]' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${criarConta ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  {criarConta && (
                    <div className="p-4 space-y-4 bg-[#111633]/50">
                      <div className="p-3 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs text-[#00D4FF]">
                        A conta de colaborador é separada da conta de candidato. O colaborador pode ter as duas contas simultaneamente.
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400">Email da conta</label>
                        <input
                          type="email"
                          value={emailConta}
                          onChange={e => setEmailConta(e.target.value)}
                          placeholder="email@empresa.com"
                          required={criarConta}
                          className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                        />
                        <p className="text-xs text-gray-500">
                          Pode ser diferente do email corporativo acima (ex: email pessoal)
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400">Senha temporária</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type={showSenha ? 'text' : 'password'}
                              value={senhaConta}
                              onChange={e => setSenhaConta(e.target.value)}
                              placeholder="Mín. 8 chars, maiúscula, número"
                              required={criarConta}
                              className="w-full bg-[#111633] border border-[#1e2a5e] rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSenha(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                              {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleSugerirSenha}
                            title="Gerar senha"
                            className="px-3 py-2.5 bg-[#111633] border border-[#1e2a5e] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all flex items-center justify-center"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Compartilhe esta senha com o colaborador após o cadastro
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="p-6 flex items-center justify-end gap-3 border-t border-[#1e2a5e] mt-auto">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#0A0E27] transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
