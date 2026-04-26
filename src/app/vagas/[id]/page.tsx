'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { FileText, ListChecks, Zap, Award, Layers, ArrowLeft, Upload } from 'lucide-react'
import type { Vaga } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-blue-500/20 text-blue-400',
  aberta: 'bg-green-500/20 text-green-400',
  pausada: 'bg-yellow-500/20 text-yellow-400',
  encerrada: 'bg-red-500/20 text-red-400',
}

export default function VagaDetailPage() {
  const params = useParams()
  const vagaId = params.id as string

  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    linkedin: '',
    pretensaoSalarial: '',
    mensagem: '',
    curriculo: null as File | null,
  })

  useEffect(() => {
    const loadVaga = async () => {
      if (!vagaId) return
      try {
        const response = await fetch(`/api/vagas/${vagaId}/details`)
        if (!response.ok) {
          setVaga(null)
        } else {
          const data = await response.json()
          setVaga(data)
        }
      } catch (error) {
        console.error('Erro ao carregar vaga:', error)
        setVaga(null)
      } finally {
        setLoading(false)
      }
    }

    loadVaga()
  }, [vagaId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande (máx. 5MB)')
        return
      }
      setFormData(prev => ({ ...prev, curriculo: file }))
      setFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email || !formData.telefone || !formData.curriculo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('vaga_id', vagaId)
      formDataToSend.append('nome', formData.nome)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('telefone', formData.telefone)
      formDataToSend.append('linkedin', formData.linkedin)
      formDataToSend.append('pretensao_salarial', formData.pretensaoSalarial)
      formDataToSend.append('mensagem', formData.mensagem)
      formDataToSend.append('curriculo', formData.curriculo)

      const response = await fetch('/api/candidaturas/submit', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar candidatura')
      }

      toast.success('Candidatura enviada com sucesso!')
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        linkedin: '',
        pretensaoSalarial: '',
        mensagem: '',
        curriculo: null,
      })
      setFileName('')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar candidatura')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Vaga não encontrada ou não está disponível</p>
        <Link href="/vagas">
          <Button variant="outline">Voltar para vagas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a5e]">
        <Link href="/vagas" className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
        <h1 className="text-xl font-bold text-white">Candidatar-se</h1>
        <div className="w-16" />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detalhes da Vaga */}
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-1">{vaga.titulo}</h2>
                  <p className="text-lg text-[#00D4FF]">{vaga.empresa?.nome}</p>
                </div>
                <Badge className={STATUS_COLORS[vaga.status]}>Aberta</Badge>
              </div>
              {vaga.categoria && (
                <Badge variant="outline" className="mb-4">
                  {vaga.categoria}
                </Badge>
              )}
            </div>

            {/* Descrição */}
            {vaga.descricao && (
              <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-sm">Descrição</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {vaga.descricao}
                </p>
              </div>
            )}

            {/* Requisitos */}
            {vaga.requisitos && (
              <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-sm">Requisitos</h3>
                </div>
                <div className="space-y-2">
                  {vaga.requisitos.split('\n').filter(r => r.trim()).map((req, idx) => (
                    <div key={idx} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-[#00D4FF] font-bold mt-0.5">•</span>
                      <span>{req.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Especificações */}
            {(vaga.hard_skills?.length || vaga.idiomas?.length || vaga.escolaridade_minima) && (
              <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-sm">Especificações Técnicas</h3>
                </div>
                <div className="space-y-3">
                  {vaga.hard_skills?.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-2">Hard Skills:</span>
                      <div className="flex flex-wrap gap-2">
                        {vaga.hard_skills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {vaga.idiomas?.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-2">Idiomas:</span>
                      <div className="flex flex-wrap gap-2">
                        {vaga.idiomas.map((idioma: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {idioma.idioma} • {idioma.nivel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {vaga.escolaridade_minima && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Escolaridade:</span>
                      <p className="text-sm text-foreground">{vaga.escolaridade_minima}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefícios */}
            {(vaga.beneficios?.length || vaga.diferenciais) && (
              <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-[#00D4FF]" />
                  <h3 className="font-semibold text-sm">Benefícios & Diferenciais</h3>
                </div>
                <div className="space-y-3">
                  {vaga.beneficios?.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-2">Benefícios:</span>
                      <div className="flex flex-wrap gap-2">
                        {vaga.beneficios.map((beneficio: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {beneficio}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {vaga.diferenciais && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-2">Diferenciais:</span>
                      <p className="text-sm text-muted-foreground">{vaga.diferenciais}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Formulário de Candidatura */}
          <div>
            <Card className="bg-card border-border sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Envie sua Candidatura</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-xs font-semibold mb-1.5">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Seu nome"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold mb-1.5">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-xs font-semibold mb-1.5">
                      Telefone *
                    </Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(11) 98765-4321"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="text-xs font-semibold mb-1.5">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="linkedin.com/in/seu-perfil"
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pretensaoSalarial" className="text-xs font-semibold mb-1.5">
                      Pretensão Salarial
                    </Label>
                    <Input
                      id="pretensaoSalarial"
                      name="pretensaoSalarial"
                      value={formData.pretensaoSalarial}
                      onChange={handleInputChange}
                      placeholder="R$ 5.000,00"
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="curriculo" className="text-xs font-semibold mb-1.5">
                      Currículo (PDF/DOC) *
                    </Label>
                    <div className="relative">
                      <input
                        id="curriculo"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <label
                        htmlFor="curriculo"
                        className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#00D4FF]/50 transition-colors bg-secondary/50"
                      >
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {fileName || 'Escolha um arquivo'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mensagem" className="text-xs font-semibold mb-1.5">
                      Mensagem (opcional)
                    </Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      placeholder="Conte mais sobre você..."
                      className="bg-secondary border-border text-xs min-h-20"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#00D4FF] to-[#0066FF] hover:opacity-90"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Candidatura'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
