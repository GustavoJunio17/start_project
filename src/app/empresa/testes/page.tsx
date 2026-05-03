'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import type { RespostaTeste, TemplateTeste } from '@/types/database'
import { ClipboardList, Plus, Trash2, Package, Edit2 } from 'lucide-react'

const supabase = createClient()

type ResultRow = RespostaTeste & { candidato?: { nome_completo: string }; colaborador?: { nome: string } }

function ResultsTable({ data, label, loading }: { data: ResultRow[]; label: string; loading: boolean }) {
  return (
    <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e2a5e]">
        <p className="text-sm font-semibold text-white">Resultados - {label}</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e2a5e]">
            {['Nome', 'Tipo', 'Score', 'Duração', 'Data'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Carregando...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum resultado ainda.</td></tr>
          ) : data.map(r => (
            <tr key={r.id} className="border-b border-[#1e2a5e]/50 hover:bg-white/[0.02] transition-colors last:border-0">
              <td className="px-4 py-3.5 font-medium text-white">
                {(r.candidato as { nome_completo?: string })?.nome_completo || (r.colaborador as { nome?: string })?.nome || '-'}
              </td>
              <td className="px-4 py-3.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                  {r.tipo.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3.5 font-medium text-white">{r.score ?? '-'}</td>
              <td className="px-4 py-3.5 text-gray-400">{r.duracao_segundos ? `${Math.floor(r.duracao_segundos / 60)}min` : '-'}</td>
              <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function EmpresaTestesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [respostasCandidatos, setRespostasCandidatos] = useState<(RespostaTeste & { candidato?: { nome_completo: string } })[]>([])
  const [respostasColaboradores, setRespostasColaboradores] = useState<(RespostaTeste & { colaborador?: { nome: string } })[]>([])
  const [templates, setTemplates] = useState<TemplateTeste[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user?.empresa_id) return
    const [resCandRes, resColRes, templRes] = await Promise.all([
      supabase.from('respostas_teste').select('*, candidato:candidatos!inner(nome_completo, empresa_id)').eq('candidatos.empresa_id', user.empresa_id).order('created_at', { ascending: false }).limit(100),
      supabase.from('respostas_teste').select('*, colaborador:colaboradores!inner(nome, empresa_id)').eq('colaboradores.empresa_id', user.empresa_id).order('created_at', { ascending: false }).limit(100),
      supabase.from('templates_testes').select('*').eq('empresa_id', user.empresa_id),
    ])
    setRespostasCandidatos(resCandRes.data || [])
    setRespostasColaboradores(resColRes.data || [])
    setTemplates(templRes.data || [])
    setLoading(false)
  }

  useEffect(() => { if (user?.empresa_id) load() }, [user])

  const handleDeleteTemplate = async (id: string) => {
    await supabase.from('questoes_disc').delete().eq('template_testes_id', id)
    await supabase.from('templates_testes').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-[#00D4FF]" /> Gestão de Testes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Testes de Candidatos', value: respostasCandidatos.length, color: 'text-white' },
          { label: 'Testes de Colaboradores', value: respostasColaboradores.length, color: 'text-white' },
          { label: 'Templates de Testes', value: templates.length, color: 'text-[#00D4FF]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111633] border border-[#1e2a5e] rounded-xl p-5">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResultsTable data={respostasCandidatos as ResultRow[]} label="Candidatos" loading={loading} />
        <ResultsTable data={respostasColaboradores as ResultRow[]} label="Colaboradores" loading={loading} />
      </div>

      <div className="bg-[#111633] border border-[#1e2a5e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a5e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm font-semibold text-white">Templates de Testes ({templates.length})</span>
          </div>
          <button onClick={() => router.push('/empresa/testes/novo-template')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all">
            <Plus className="w-3.5 h-3.5" /> Novo Template
          </button>
        </div>
        <div className="p-4">
          {templates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Nenhum template. Crie o primeiro acima.</p>
          ) : (
            <div className="space-y-3">
              {templates.map(t => (
                <div key={t.id} onClick={() => router.push(`/empresa/testes/${t.id}`)}
                  className="p-4 rounded-lg bg-[#0A0E27] border border-[#1e2a5e] group cursor-pointer hover:border-[#00D4FF]/40 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{t.nome}</p>
                      {t.descricao && <p className="text-xs text-gray-500 mt-1">{t.descricao}</p>}
                    </div>
                    <div className="ml-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); router.push(`/empresa/testes/${t.id}/editar`) }}
                        className="p-1 text-gray-500 hover:text-[#00D4FF] transition-colors" title="Editar template">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDeleteTemplate(t.id) }}
                        className="p-1 text-gray-500 hover:text-[#EF4444] transition-colors" title="Deletar template">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-white/5 inline-block px-2 py-1 rounded mt-2">
                    {t.questoes_ids.length} questões
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
