'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import Link from 'next/link'
import { FileText, ListChecks, Award, Layers, ArrowLeft, Upload, CheckCircle, LogIn, UserPlus } from 'lucide-react'
import type { Vaga } from '@/types/database'

export default function VagaDetailPage() {
  const params = useParams()
  const vagaId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [vagaLoading, setVagaLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const [formData, setFormData] = useState({ telefone: '', linkedin: '', pretensaoSalarial: '', mensagem: '', curriculo: null as File | null })

  useEffect(() => {
    if (!vagaId) return
    fetch(`/api/vagas/${vagaId}/details`).then(r => r.ok ? r.json() : null).then(setVaga).catch(() => setVaga(null)).finally(() => setVagaLoading(false))
  }, [vagaId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Arquivo muito grande (máx. 5MB)'); return }
      setFormData(prev => ({ ...prev, curriculo: file }))
      setFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.telefone || !formData.curriculo) { toast.error('Preencha todos os campos obrigatórios'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('vaga_id', vagaId); fd.append('telefone', formData.telefone); fd.append('linkedin', formData.linkedin)
      fd.append('pretensao_salarial', formData.pretensaoSalarial); fd.append('mensagem', formData.mensagem); fd.append('curriculo', formData.curriculo)
      const response = await fetch('/api/candidaturas/submit', { method: 'POST', body: fd, credentials: 'include' })
      if (response.status === 409) { toast.error('Você já enviou uma candidatura para esta vaga'); setSubmitted(true); return }
      if (!response.ok) throw new Error()
      setSubmitted(true)
    } catch { toast.error('Erro ao enviar candidatura') }
    finally { setSubmitting(false) }
  }

  const inputClass = "w-full px-3 py-2.5 bg-[#0A0E27] border border-[#1e2a5e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors placeholder-gray-600"
  const cardClass = "bg-[#111633] border border-[#1e2a5e] rounded-xl"
  const sectionClass = "bg-[#0A0E27] border border-[#1e2a5e] rounded-xl p-4"
  const redirectParam = encodeURIComponent(`/vagas/${vagaId}`)

  if (vagaLoading || authLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00D4FF]/20 border-t-[#00D4FF] rounded-full animate-spin" />
    </div>
  )

  if (!vaga) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400">Vaga não encontrada ou não está disponível</p>
      <Link href="/vagas" className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all">Voltar para vagas</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a5e]">
        <Link href="/vagas" className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Voltar</span>
        </Link>
        <h1 className="text-xl font-bold text-white">Candidatar-se</h1>
        <div className="w-16" />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className={`${cardClass} p-6`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{vaga.titulo}</h2>
                  <p className="text-lg text-[#00D4FF]">{vaga.empresa?.nome}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Aberta</span>
              </div>
              {vaga.categoria && <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs border border-[#1e2a5e] text-gray-400">{vaga.categoria}</span>}
            </div>

            {vaga.descricao && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-[#00D4FF]" /><h3 className="font-semibold text-sm text-white">Descrição</h3></div>
                <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{vaga.descricao}</p>
              </div>
            )}

            {vaga.requisitos && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3"><ListChecks className="w-4 h-4 text-[#00D4FF]" /><h3 className="font-semibold text-sm text-white">Requisitos</h3></div>
                <div className="space-y-2">
                  {vaga.requisitos.split('\n').filter(r => r.trim()).map((req, idx) => (
                    <div key={idx} className="flex gap-2 text-sm text-gray-400">
                      <span className="text-[#00D4FF] font-bold mt-0.5">•</span><span>{req.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(vaga.hard_skills?.length || vaga.idiomas?.length || vaga.escolaridade_minima) && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-[#00D4FF]" /><h3 className="font-semibold text-sm text-white">Especificações Técnicas</h3></div>
                <div className="space-y-3">
                  {(vaga.hard_skills?.length ?? 0) > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 font-medium block mb-2">Hard Skills:</span>
                      <div className="flex flex-wrap gap-2">{vaga.hard_skills?.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-[#1e2a5e] text-gray-400">{s}</span>)}</div>
                    </div>
                  )}
                  {(vaga.idiomas?.length ?? 0) > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 font-medium block mb-2">Idiomas:</span>
                      <div className="flex flex-wrap gap-2">{vaga.idiomas?.map((id: any, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-[#1e2a5e] text-gray-400">{id.idioma} • {id.nivel}</span>)}</div>
                    </div>
                  )}
                  {vaga.escolaridade_minima && <div><span className="text-xs text-gray-500 font-medium block mb-1">Escolaridade:</span><p className="text-sm text-gray-300">{vaga.escolaridade_minima}</p></div>}
                </div>
              </div>
            )}

            {(vaga.beneficios?.length || vaga.diferenciais) && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-[#00D4FF]" /><h3 className="font-semibold text-sm text-white">Benefícios & Diferenciais</h3></div>
                <div className="space-y-3">
                  {(vaga.beneficios?.length ?? 0) > 0 && <div><span className="text-xs text-gray-500 font-medium block mb-2">Benefícios:</span><div className="flex flex-wrap gap-2">{vaga.beneficios?.map((b: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-[#1e2a5e] text-gray-400">{b}</span>)}</div></div>}
                  {vaga.diferenciais && <div><span className="text-xs text-gray-500 font-medium block mb-2">Diferenciais:</span><p className="text-sm text-gray-400">{vaga.diferenciais}</p></div>}
                </div>
              </div>
            )}
          </div>

          <div>
            {!user ? (
              <div className={`${cardClass} p-8 flex flex-col items-center text-center gap-6 sticky top-6`}>
                <div className="w-14 h-14 rounded-full bg-[#00D4FF]/10 flex items-center justify-center"><LogIn className="w-7 h-7 text-[#00D4FF]" /></div>
                <div><h3 className="text-lg font-semibold text-white mb-1">Faça login para se candidatar</h3><p className="text-sm text-gray-400">Você precisa ter uma conta para enviar sua candidatura.</p></div>
                <div className="w-full space-y-3">
                  <Link href={`/auth/login?redirect=${redirectParam}`} className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
                    <LogIn className="w-4 h-4" /> Entrar
                  </Link>
                  <Link href={`/auth/register?redirect=${redirectParam}`} className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all">
                    <UserPlus className="w-4 h-4" /> Criar conta
                  </Link>
                </div>
                <p className="text-xs text-gray-500">Após o login você será redirecionado de volta para esta vaga.</p>
              </div>
            ) : user.role !== 'candidato' ? (
              <div className={`${cardClass} p-8 flex flex-col items-center text-center gap-4 sticky top-6`}>
                <p className="text-sm text-gray-400">Apenas candidatos podem se candidatar a vagas. Faça login com uma conta de candidato.</p>
                <Link href="/auth/login" className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all">Trocar conta</Link>
              </div>
            ) : submitted ? (
              <div className={`${cardClass} p-8 flex flex-col items-center text-center gap-4 sticky top-6`}>
                <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center"><CheckCircle className="w-7 h-7 text-[#10B981]" /></div>
                <div><h3 className="text-lg font-semibold text-white mb-1">Candidatura enviada!</h3><p className="text-sm text-gray-400">Sua candidatura para <strong className="text-white">{vaga.titulo}</strong> foi registrada com sucesso.</p></div>
                <Link href="/vagas" className="px-4 py-2 border border-[#1e2a5e] text-gray-300 rounded-lg text-sm hover:bg-[#1e2a5e]/50 hover:text-white transition-all">Ver mais vagas</Link>
                <Link href="/candidato/dashboard" className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all">Meu painel</Link>
              </div>
            ) : (
              <div className={`${cardClass} p-6 sticky top-6`}>
                <h3 className="text-lg font-semibold text-white mb-1">Envie sua Candidatura</h3>
                <p className="text-xs text-gray-500 mb-4">Candidatando como <span className="text-[#00D4FF]">{user.email}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-300">Telefone / WhatsApp *</label><input name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(11) 98765-4321" required className={inputClass} /></div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-300">LinkedIn</label><input name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/seu-perfil" className={inputClass} /></div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-300">Pretensão Salarial</label><input name="pretensaoSalarial" value={formData.pretensaoSalarial} onChange={handleInputChange} placeholder="R$ 5.000,00" className={inputClass} /></div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Currículo (PDF/DOC) *</label>
                    <input id="curriculo" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" required />
                    <label htmlFor="curriculo" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#1e2a5e] rounded-lg cursor-pointer hover:border-[#00D4FF]/50 transition-colors bg-[#0A0E27]">
                      <Upload className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500">{fileName || 'Escolha um arquivo'}</span>
                    </label>
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-300">Mensagem (opcional)</label><textarea name="mensagem" value={formData.mensagem} onChange={handleInputChange} placeholder="Conte mais sobre você..." rows={3} className={`${inputClass} resize-none`} /></div>
                  <button type="submit" disabled={submitting} className="w-full py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60">
                    {submitting ? 'Enviando...' : 'Enviar Candidatura'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
