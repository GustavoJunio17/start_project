'use client'


import { Empresa } from './types'
import {
  Building2,
  Users,
  Briefcase,
  MessageSquare,
  Calendar,
  Link as LinkIcon,
  Mail,
  Edit2,
  Power,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CompanyDrawerProps {
  empresa: Empresa | null
  isOpen: boolean
  onClose: () => void
  onEdit: (empresa: Empresa) => void
  onToggleStatus: (empresa: Empresa) => void
  onDelete: (empresa: Empresa) => void
}

const statusColors: Record<string, string> = {
  ativa: 'bg-success/20 text-success',
  inativa: 'bg-gray-500/20 text-gray-400',
  trial: 'bg-amber-500/20 text-amber-600',
  bloqueada: 'bg-destructive/20 text-destructive',
}

const planoNomes: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Iniciante',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
}

export function CompanyDrawer({
  empresa,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: CompanyDrawerProps) {
  if (!empresa) return null

  const dataFormatada = formatDistanceToNow(new Date(empresa.data_cadastro), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-[#111633] border-l border-[#1e2a5e] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#1e2a5e]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">{empresa.nome}</h2>
                <p className="text-xs text-[#00D4FF] truncate">{empresa.segmento}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#0A0E27] transition-colors -mr-2 -mt-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status e Plano */}
          <div className="flex gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              empresa.status === 'ativa' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 
              empresa.status === 'trial' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
              empresa.status === 'bloqueada' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
              'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
              {empresa.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
              {planoNomes[empresa.plano]}
            </span>
          </div>

          <div className="h-px bg-[#1e2a5e]/50 w-full" />

          {/* Informações */}
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">CNPJ</p>
              <p className="text-sm font-mono text-gray-200">{empresa.cnpj || '-'}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email de Contato</p>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                  <Mail className="w-4 h-4 text-[#00D4FF]" />
                </div>
                <a href={`mailto:${empresa.email_contato}`} className="text-sm text-gray-200 hover:text-[#00D4FF] transition-colors truncate">
                  {empresa.email_contato || '-'}
                </a>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cadastro</p>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-[#0A0E27] border border-[#1e2a5e]">
                  <Calendar className="w-4 h-4 text-[#00D4FF]" />
                </div>
                <p className="text-sm text-gray-200">{dataFormatada}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#1e2a5e]/50 w-full" />

          {/* Métricas */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Visão Geral</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0A0E27] rounded-xl p-3 text-center border border-[#1e2a5e] hover:border-[#00D4FF]/30 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-1.5 bg-[#00D4FF]/10 rounded-lg">
                    <Users className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-white">{empresa.total_usuarios}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Usuários</p>
              </div>

              <div className="bg-[#0A0E27] rounded-xl p-3 text-center border border-[#1e2a5e] hover:border-[#00D4FF]/30 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-1.5 bg-[#00D4FF]/10 rounded-lg">
                    <Briefcase className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-white">{empresa.total_vagas}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Vagas</p>
              </div>

              <div className="bg-[#0A0E27] rounded-xl p-3 text-center border border-[#1e2a5e] hover:border-[#00D4FF]/30 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-1.5 bg-[#00D4FF]/10 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-white">{empresa.total_candidatos}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Candidatos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="p-6 border-t border-[#1e2a5e] bg-[#0A0E27] space-y-3">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111633] text-gray-300 border border-[#1e2a5e] rounded-lg text-sm font-medium hover:text-white hover:border-[#00D4FF]/50 transition-all"
            onClick={() => {
              onEdit(empresa)
              onClose()
            }}
          >
            <Edit2 className="w-4 h-4" />
            Editar Detalhes
          </button>

          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111633] text-gray-400 border border-[#1e2a5e] rounded-lg text-sm font-medium hover:text-gray-200 hover:border-gray-500 transition-all"
            onClick={() => {
              onToggleStatus(empresa)
              onClose()
            }}
          >
            <Power className="w-4 h-4" />
            {empresa.status === 'ativa' ? 'Desativar Empresa' : 'Ativar Empresa'}
          </button>

          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 hover:text-red-300 transition-all"
            onClick={() => {
              onDelete(empresa)
              onClose()
            }}
          >
            <Trash2 className="w-4 h-4" />
            Excluir Empresa
          </button>
        </div>
      </div>
    </>
  )
}
