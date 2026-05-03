'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/db/client'
import type { User, Candidato, StatusCandidatura, Classificacao } from '@/types/database'
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Star,
  BarChart3,
  CheckCircle2,
  Database,
  User as UserIcon,
} from 'lucide-react'

interface Props {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onToggleStatus: (id: string, current: boolean) => void
}

const statusLabels: Record<StatusCandidatura, string> = {
  inscrito: 'Inscrito',
  em_avaliacao: 'Em Avaliação',
  entrevista_agendada: 'Entrevista Agendada',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  contratado: 'Contratado',
}

const statusColors: Record<StatusCandidatura, string> = {
  inscrito: 'bg-blue-500/20 text-blue-400',
  em_avaliacao: 'bg-amber-500/20 text-amber-400',
  entrevista_agendada: 'bg-purple-500/20 text-purple-400',
  aprovado: 'bg-green-500/20 text-green-400',
  reprovado: 'bg-red-500/20 text-red-400',
  contratado: 'bg-emerald-500/20 text-emerald-400',
}

const classificacaoColors: Record<Classificacao, string> = {
  ouro: 'bg-yellow-500/20 text-yellow-400',
  prata: 'bg-slate-400/20 text-slate-300',
  bronze: 'bg-orange-600/20 text-orange-400',
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400 font-medium">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden border border-[#1e2a5e]/30">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function CandidatoDrawer({ user, isOpen, onClose, onToggleStatus }: Props) {
  const [perfil, setPerfil] = useState<Candidato | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user || !isOpen) return
    setLoading(true)
    supabase
      .from('candidatos')
      .select('*, vaga:vagas(titulo, empresa:empresas(nome))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setPerfil(data || null)
        setLoading(false)
      })
  }, [user, isOpen])

  if (!user) return null

  const initials = user.nome_completo
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#1e2a5e] flex items-center justify-between relative">
              <div className="flex items-center gap-4 pr-8">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-white leading-tight">{user.nome_completo}</h2>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Custom Switch Toggle */}
                  <button
                    onClick={() => onToggleStatus(user.id, user.ativo)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.ativo ? 'bg-[#10B981]' : 'bg-gray-600'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.ativo ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </button>
                  <span className="text-xs text-gray-400">{user.ativo ? 'Ativo' : 'Inat.'}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#0A0E27] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Contato */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contato</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                      <Mail className="w-4 h-4 text-[#00D4FF] shrink-0" />
                    </div>
                    <span className="text-gray-200 truncate">{user.email}</span>
                  </div>
                  {perfil?.whatsapp && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                        <Phone className="w-4 h-4 text-[#00D4FF] shrink-0" />
                      </div>
                      <span className="text-gray-200">{perfil.whatsapp}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                      <Calendar className="w-4 h-4 text-[#00D4FF] shrink-0" />
                    </div>
                    <span className="text-gray-400">
                      Cadastro em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-gray-400 text-center py-4">Carregando perfil...</p>
              ) : perfil ? (
                <>
                  <div className="h-px bg-[#1e2a5e]/50 w-full" />

                  {/* Candidatura */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidatura</p>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[perfil.status_candidatura]}`}>
                          {statusLabels[perfil.status_candidatura]}
                        </span>
                        {perfil.classificacao && (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${classificacaoColors[perfil.classificacao]}`}>
                            {perfil.classificacao}
                          </span>
                        )}
                        {perfil.disponivel_banco_talentos && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                            <Database className="w-3 h-3" /> Banco
                          </span>
                        )}
                      </div>

                      {perfil.cargo_pretendido && (
                        <div className="flex items-center gap-3 text-sm mt-3">
                          <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                            <Briefcase className="w-4 h-4 text-[#00D4FF] shrink-0" />
                          </div>
                          <span className="text-gray-200">{perfil.cargo_pretendido}</span>
                        </div>
                      )}

                      {perfil.vaga && (
                        <div className="flex items-center gap-3 text-sm mt-2">
                          <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                            <UserIcon className="w-4 h-4 text-[#00D4FF] shrink-0" />
                          </div>
                          <span className="text-gray-200">
                            {(perfil.vaga as { titulo: string; empresa?: { nome: string } }).titulo}
                            {(perfil.vaga as { titulo: string; empresa?: { nome: string } }).empresa && (
                              <span className="text-gray-500">
                                {' '}— {(perfil.vaga as { titulo: string; empresa?: { nome: string } }).empresa!.nome}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scores */}
                  {(perfil.match_score !== null || perfil.score_logica !== null || perfil.score_vendas !== null) && (
                    <>
                      <div className="h-px bg-[#1e2a5e]/50 w-full" />
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Scores
                        </p>
                        <div className="space-y-3">
                          {perfil.match_score !== null && (
                            <ScoreBar label="Match" value={perfil.match_score} color="bg-gradient-to-r from-[#00D4FF] to-[#0066FF]" />
                          )}
                          {perfil.score_logica !== null && (
                            <ScoreBar label="Lógica" value={perfil.score_logica} color="bg-purple-500" />
                          )}
                          {perfil.score_vendas !== null && (
                            <ScoreBar label="Vendas" value={perfil.score_vendas} color="bg-amber-500" />
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* DISC */}
                  {perfil.perfil_disc && (
                    <>
                      <div className="h-px bg-[#1e2a5e]/50 w-full" />
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Star className="w-3.5 h-3.5" />
                          Perfil DISC
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {(['D', 'I', 'S', 'C'] as const).map(key => (
                            <div key={key} className="bg-[#0A0E27] rounded-lg p-3 text-center border border-[#1e2a5e] shadow-sm">
                              <p className="text-xs font-bold text-[#00D4FF] mb-1">{key}</p>
                              <p className="text-lg font-semibold text-white">{perfil.perfil_disc![key]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="h-px bg-[#1e2a5e]/50 w-full" />
                  <div className="flex flex-col items-center gap-2 py-8 text-center bg-[#0A0E27] rounded-xl border border-[#1e2a5e] border-dashed">
                    <CheckCircle2 className="w-8 h-8 text-[#1e2a5e] mb-2" />
                    <p className="text-sm text-gray-300">Nenhum perfil de candidatura encontrado.</p>
                    <p className="text-xs text-gray-500">O candidato ainda não se inscreveu em nenhuma vaga.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
