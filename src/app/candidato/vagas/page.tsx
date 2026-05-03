'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Vaga } from '@/types/database'
import { Search, Briefcase, Building2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function CandidatoVagasPage() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<(Vaga & { empresa?: { nome: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedVaga, setSelectedVaga] = useState<(Vaga & { empresa?: { nome: string } }) | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState<string[]>([])
  const [cargoPretendido, setCargoPretendido] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: vagasData } = await supabase.from('vagas').select('*, empresa:empresas(nome)').eq('status', 'aberta').order('created_at', { ascending: false })
      setVagas(vagasData || [])
      if (user) {
        const { data: candidaturas } = await supabase.from('candidatos').select('vaga_id').eq('user_id', user.id)
        setApplied((candidaturas || []).map(c => c.vaga_id).filter(Boolean) as string[])
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleApply = async () => {
    if (!user || !selectedVaga) return
    setApplying(true)
    const { data: existing } = await supabase.from('candidatos').select('id, data_ultimo_teste')
      .eq('user_id', user.id).eq('empresa_id', selectedVaga.empresa_id)
      .order('created_at', { ascending: false }).limit(1)
    if (existing?.length) {
      const lastTest = existing[0].data_ultimo_teste
      if (lastTest) {
        const monthsSince = (Date.now() - new Date(lastTest).getTime()) / (1000 * 60 * 60 * 24 * 30)
        if (monthsSince < 12) { setApplying(false); return }
      }
    }
    await supabase.from('candidatos').insert({
      user_id: user.id, empresa_id: selectedVaga.empresa_id, vaga_id: selectedVaga.id,
      nome_completo: user.nome_completo, email: user.email, whatsapp: user.telefone,
      cargo_pretendido: cargoPretendido || selectedVaga.titulo,
    })
    setApplied([...applied, selectedVaga.id])
    setApplying(false); setSelectedVaga(null); setCargoPretendido('')
  }

  const filtered = vagas.filter(v =>
    v.titulo.toLowerCase().includes(search.toLowerCase()) ||
    v.categoria?.toLowerCase().includes(search.toLowerCase()) ||
    (v.empresa as any)?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#00D4FF]" /> Vagas Disponíveis
          </h1>
          <p className="text-gray-400 text-sm mt-1">Explore oportunidades que dão match com seu perfil.</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-[#00D4FF]/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D4FF] transition-colors" />
          <input 
            placeholder="Buscar por cargo, empresa ou categoria..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111633]/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all relative z-10" 
          />
        </div>
      </div>

      <Dialog open={!!selectedVaga} onOpenChange={open => !open && setSelectedVaga(null)}>
        <DialogContent className="bg-[#0A0E27] border-white/[0.1] shadow-2xl shadow-black/50 sm:max-w-[500px] p-0 overflow-hidden rounded-3xl">
          {selectedVaga && (
            <div className="flex flex-col">
              <div className="h-32 bg-gradient-to-br from-[#00D4FF]/20 to-[#0066FF]/20 relative">
                <div className="absolute -bottom-6 left-8 w-14 h-14 rounded-2xl bg-[#111633] border border-white/[0.1] flex items-center justify-center text-[#00D4FF] font-bold text-xl shadow-xl">
                  {(selectedVaga.empresa as any)?.nome?.charAt(0) || 'V'}
                </div>
              </div>
              
              <div className="p-8 pt-10 space-y-6">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">{selectedVaga.titulo}</DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5"><Building2 size={14} className="text-[#00D4FF]" />{(selectedVaga.empresa as any)?.nome}</span>
                    {selectedVaga.categoria && <span className="w-1 h-1 rounded-full bg-gray-700" />}
                    {selectedVaga.categoria && <span className="text-[#00D4FF]/80">{selectedVaga.categoria}</span>}
                  </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedVaga.descricao && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Sobre a vaga</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{selectedVaga.descricao}</p>
                    </div>
                  )}
                  {selectedVaga.requisitos && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Requisitos</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{selectedVaga.requisitos}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/[0.05] space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Cargo que pretende ocupar</label>
                    <input 
                      value={cargoPretendido} 
                      onChange={e => setCargoPretendido(e.target.value)}
                      placeholder={selectedVaga.titulo}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors" 
                    />
                  </div>
                  <button 
                    onClick={handleApply} 
                    disabled={applying}
                    className="w-full py-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#00D4FF]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                  >
                    {applying ? 'Processando...' : 'Confirmar Candidatura'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-48 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="glass-card col-span-full py-20 text-center border-dashed">
            <Search size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma vaga encontrada com os termos buscados.</p>
          </div>
        ) : filtered.map((vaga, idx) => {
          const alreadyApplied = applied.includes(vaga.id)
          return (
            <div 
              key={vaga.id} 
              className="glass-card p-6 hover:border-[#00D4FF]/30 hover:-translate-y-1 transition-all group animate-in fade-in zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00D4FF] font-bold group-hover:border-[#00D4FF]/40 transition-colors">
                  {(vaga.empresa as any)?.nome?.charAt(0) || 'V'}
                </div>
                {vaga.categoria && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    {vaga.categoria}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-lg text-white mb-1 group-hover:text-[#00D4FF] transition-colors">{vaga.titulo}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Building2 className="w-3 h-3" />
                <span>{(vaga.empresa as any)?.nome}</span>
              </div>

              {vaga.descricao && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                  {vaga.descricao}
                </p>
              )}

              {alreadyApplied ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#10B981]/5 border border-[#10B981]/20 text-[#10B981] rounded-xl text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> Já candidatado
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedVaga(vaga)}
                  className="w-full py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-white rounded-xl font-semibold text-sm group-hover:bg-gradient-to-r group-hover:from-[#00D4FF] group-hover:to-[#0066FF] group-hover:border-transparent transition-all group-hover:shadow-lg group-hover:shadow-[#00D4FF]/20"
                >
                  Candidatar-se
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
