"use client"

import { useState, useEffect } from "react"

import { createClient } from "@/lib/db/client"
import { useAuth } from "@/hooks/useAuth"
import type { Vaga, StatusVaga, Empresa } from "@/types/database"

interface FormVagaProps {
  vaga: Vaga | null
  empresas: Pick<Empresa, 'id' | 'nome'>[]
  onClose: () => void
  onSaved: () => void
}

export function FormVaga({ vaga, empresas, onClose, onSaved }: FormVagaProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    titulo: vaga?.titulo || '',
    empresa_id: vaga?.empresa_id || (empresas.length > 0 ? empresas[0].id : ''),
    descricao: vaga?.descricao || '',
    requisitos: vaga?.requisitos || '',
    categoria: vaga?.categoria || '',
    status: vaga?.status || 'rascunho' as StatusVaga,
  })

  useEffect(() => {
    if (vaga) {
      setFormData({
        titulo: vaga.titulo,
        empresa_id: vaga.empresa_id,
        descricao: vaga.descricao || '',
        requisitos: vaga.requisitos || '',
        categoria: vaga.categoria || '',
        status: vaga.status,
      })
    }
  }, [vaga])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        titulo: formData.titulo,
        empresa_id: formData.empresa_id,
        descricao: formData.descricao || null,
        requisitos: formData.requisitos || null,
        categoria: formData.categoria || null,
        status: formData.status,
      }

      if (vaga) {
        const { error } = await supabase
          .from('vagas')
          .update(payload)
          .eq('id', vaga.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vagas')
          .insert([{ ...payload, criado_por: user?.id }])
          
        if (error) throw error
      }
      onSaved()
    } catch (error: any) {
      alert('Erro ao salvar vaga: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-2xl my-8 relative flex flex-col animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#0A0E27] transition-colors"
          >
            ✕
          </button>
          
          <div className="px-6 pt-6 pb-4 border-b border-[#1e2a5e]">
            <h2 className="text-xl font-bold text-white">
              {vaga ? 'Editar Vaga' : 'Criar Nova Vaga'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {vaga ? 'Atualize as informações da vaga abaixo.' : 'Preencha os dados para criar uma vaga para uma empresa do sistema.'}
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Título da Vaga *</label>
                  <input 
                    type="text"
                    value={formData.titulo} 
                    onChange={e => setFormData(f => ({...f, titulo: e.target.value}))} 
                    placeholder="Ex: Desenvolvedor Front-end Pleno"
                    required
                    className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Empresa *</label>
                  <div className="relative">
                    <select 
                      value={formData.empresa_id} 
                      onChange={(e) => setFormData(f => ({...f, empresa_id: e.target.value}))}
                      required
                      className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#111633] text-gray-500">Selecione uma empresa</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id} className="bg-[#111633] text-white">{emp.nome}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Categoria</label>
                  <input 
                    type="text"
                    value={formData.categoria} 
                    onChange={e => setFormData(f => ({...f, categoria: e.target.value}))} 
                    placeholder="Ex: Tecnologia, Vendas"
                    className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all"
                  />
                </div>

                {vaga?.status !== 'rascunho' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(f => ({...f, status: e.target.value as StatusVaga}))}
                        className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="aberta" className="bg-[#111633] text-white">Aberta</option>
                        <option value="pausada" className="bg-[#111633] text-white">Pausada</option>
                        <option value="encerrada" className="bg-[#111633] text-white">Encerrada</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Descrição</label>
                  <textarea 
                    value={formData.descricao} 
                    onChange={e => setFormData(f => ({...f, descricao: e.target.value}))} 
                    placeholder="Descreva as responsabilidades, atividades e detalhes da vaga..."
                    className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all min-h-[120px] resize-y"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Requisitos</label>
                  <textarea 
                    value={formData.requisitos} 
                    onChange={e => setFormData(f => ({...f, requisitos: e.target.value}))} 
                    placeholder="Descreva os requisitos técnicos, comportamentais e desejáveis..."
                    className="w-full bg-[#0A0E27] border border-[#1e2a5e] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/50 transition-all min-h-[120px] resize-y"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-[#1e2a5e] mt-6">
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
                  disabled={loading || !formData.empresa_id || !formData.titulo}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Salvando...' : 'Salvar Vaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
