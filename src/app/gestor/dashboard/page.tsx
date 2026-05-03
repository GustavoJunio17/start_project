'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import {
  ClipboardList,
  MessageSquare,
  CalendarClock,
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MapPin,
  Award,
  Code2,
} from 'lucide-react'
import Link from 'next/link'
import type { Colaborador } from '@/types/database'

const DISC_COLORS: Record<string, string> = { D: '#EF4444', I: '#F59E0B', S: '#10B981', C: '#3B82F6' }
const DISC_LABELS: Record<string, string> = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
}

const STATUS_LABELS: Record<string, string> = {
  em_treinamento: 'Em Treinamento',
  ativo: 'Ativo',
  desligado: 'Desligado',
}
const STATUS_COLORS: Record<string, string> = {
  em_treinamento: '#F59E0B',
  ativo: '#10B981',
  desligado: '#EF4444',
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1e2a5e]/50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-200 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function DaysUntil({ dateStr }: { dateStr: string }) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (diff < 0) return <span className="text-red-400 text-xs font-medium">Atrasada</span>
  if (diff === 0) return <span className="text-yellow-400 text-xs font-medium">Hoje</span>
  return <span className="text-gray-400 text-xs">em {diff} dias</span>
}

export default function ColaboradorDashboard() {
  const { user } = useAuth()
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [counts, setCounts] = useState({ testes: 0, feedbacks: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      const { data: col } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (col) {
        const [testRes, fbRes] = await Promise.all([
          supabase.from('respostas_teste').select('id', { count: 'exact', head: true }).eq('colaborador_id', col.id),
          supabase.from('feedbacks').select('id', { count: 'exact', head: true }).eq('colaborador_id', col.id),
        ])
        setCounts({ testes: testRes.count || 0, feedbacks: fbRes.count || 0 })
        setColaborador(col)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    )
  }

  const nome = colaborador?.nome || user?.nome_completo || 'Colaborador'
  const initials = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5 flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #0066FF, #00D4FF)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">Bem-vindo, {nome}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {colaborador?.cargo && (
              <span className="text-sm text-gray-400">{colaborador.cargo}</span>
            )}
            {colaborador?.cargo && colaborador?.status && (
              <span className="text-gray-600">·</span>
            )}
            {colaborador?.status && (
              <Badge
                label={STATUS_LABELS[colaborador.status] || colaborador.status}
                color={STATUS_COLORS[colaborador.status] || '#6B7280'}
              />
            )}
          </div>
          {user?.empresa_nome && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {user.empresa_nome}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/gestor/testes">
          <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4 hover:border-[#00D4FF]/40 transition-colors group cursor-pointer">
            <ClipboardList className="w-5 h-5 mb-2.5 text-[#00D4FF] group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-bold text-white">{counts.testes}</p>
            <p className="text-xs text-gray-500 mt-0.5">Testes Realizados</p>
          </div>
        </Link>
        <Link href="/gestor/feedbacks">
          <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4 hover:border-[#10B981]/40 transition-colors group cursor-pointer">
            <MessageSquare className="w-5 h-5 mb-2.5 text-[#10B981] group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-bold text-white">{counts.feedbacks}</p>
            <p className="text-xs text-gray-500 mt-0.5">Feedbacks Recebidos</p>
          </div>
        </Link>
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-4">
          <CalendarClock className="w-5 h-5 mb-2.5 text-[#A855F7]" />
          {colaborador?.proxima_reavaliacao ? (
            <>
              <p className="text-sm font-bold text-white">
                {new Date(colaborador.proxima_reavaliacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Próx. Reavaliação</p>
              <DaysUntil dateStr={colaborador.proxima_reavaliacao} />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-600">—</p>
              <p className="text-xs text-gray-500 mt-0.5">Próx. Reavaliação</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dados Pessoais */}
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#00D4FF]" />
            <p className="text-sm font-semibold text-white">Dados Pessoais</p>
          </div>
          <div>
            <DataRow label="E-mail" value={colaborador?.email || user?.email} />
            <DataRow label="Telefone" value={colaborador?.telefone} />
            <DataRow label="Escolaridade" value={colaborador?.escolaridade} />
          </div>
        </div>

        {/* Dados Profissionais */}
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-[#00D4FF]" />
            <p className="text-sm font-semibold text-white">Dados Profissionais</p>
          </div>
          <div>
            <DataRow label="Cargo" value={colaborador?.cargo} />
            <DataRow label="Departamento" value={colaborador?.departamento} />
            <DataRow label="Nível" value={colaborador?.nivel} />
            <DataRow label="Regime" value={colaborador?.regime_contrato} />
            <DataRow label="Modelo" value={colaborador?.modelo_trabalho} />
            <DataRow
              label="Contratado em"
              value={
                colaborador?.data_contratacao
                  ? new Date(colaborador.data_contratacao).toLocaleDateString('pt-BR')
                  : null
              }
            />
          </div>
        </div>
      </div>

      {/* Hard Skills */}
      {colaborador?.hard_skills && colaborador.hard_skills.length > 0 && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-[#00D4FF]" />
            <p className="text-sm font-semibold text-white">Hard Skills</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {colaborador.hard_skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#0A0E27] border border-[#1e2a5e] text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Perfil DISC */}
      {colaborador?.perfil_disc && (
        <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-[#00D4FF]" />
            <p className="text-sm font-semibold text-white">Perfil DISC</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(['D', 'I', 'S', 'C'] as const).map((dim) => {
              const val = colaborador.perfil_disc![dim] as number
              const max = 20
              const pct = Math.min(100, Math.round((val / max) * 100))
              return (
                <div key={dim} className="bg-[#0A0E27] border border-[#1e2a5e] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: DISC_COLORS[dim] }}>
                    {val}
                  </div>
                  <div className="w-full bg-[#1e2a5e] rounded-full h-1.5 mb-2">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: DISC_COLORS[dim] }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-300">{dim}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{DISC_LABELS[dim]}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
