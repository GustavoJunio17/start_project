'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  validarCNPJ,
  validarEmail,
  validarSenha,
  validarNomeEmpresa,
  areasAtuacao,
  planosInfo,
} from '@/lib/validations/empresa'
import { maskPhone, maskCNPJ } from '@/lib/utils/masks'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { useRouter } from 'next/navigation'

export function FormCadastroEmpresa() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    area_atuacao: 'Outros',
    plano: 'starter',
    email_admin: '',
    senha_admin: '',
    email_contato: '',
    telefone: '',
  })

  const initialFormState = {
    nome: '',
    cnpj: '',
    area_atuacao: 'Outros',
    plano: 'starter',
    email_admin: '',
    senha_admin: '',
    email_contato: '',
    telefone: '',
  }

  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({})

  // Verificar se é super_admin ou super_gestor
  if (!user || (user.role !== 'super_admin' && user.role !== 'super_gestor')) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
        Apenas super_admin e super_gestor podem cadastrar empresas
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    let newValue = value
    if (name === 'cnpj') newValue = maskCNPJ(value)
    else if (name === 'telefone') newValue = maskPhone(value)

    setFormData((prev) => ({ ...prev, [name]: newValue }))

    if (errosValidacao[name]) {
      setErrosValidacao((prev) => {
        const novo = { ...prev }
        delete novo[name]
        return novo
      })
    }
  }

  function validar(): boolean {
    const novosErros: Record<string, string> = {}

    if (!formData.nome || !validarNomeEmpresa(formData.nome)) {
      novosErros.nome = 'Nome deve ter entre 3 e 100 caracteres'
    }

    if (!formData.cnpj || !validarCNPJ(formData.cnpj.replace(/\D/g, ''))) {
      novosErros.cnpj = 'CNPJ inválido'
    }

    if (!areasAtuacao.includes(formData.area_atuacao)) {
      novosErros.area_atuacao = 'Selecione uma área válida'
    }

    if (!formData.email_admin || !validarEmail(formData.email_admin)) {
      novosErros.email_admin = 'Email inválido'
    }

    if (!formData.senha_admin) {
      novosErros.senha_admin = 'Senha é obrigatória'
    } else {
      const validacao = validarSenha(formData.senha_admin)
      if (!validacao.valida) {
        novosErros.senha_admin = validacao.erros[0]
      }
    }

    if (formData.email_contato && !validarEmail(formData.email_contato)) {
      novosErros.email_contato = 'Email de contato inválido'
    }

    const telDigits = formData.telefone.replace(/\D/g, '')
    if (formData.telefone && !/^\d{10,11}$/.test(telDigits)) {
      novosErros.telefone = 'Telefone deve ter 10 ou 11 dígitos'
    }

    setErrosValidacao(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)

    if (!validar()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cnpj: formData.cnpj.replace(/\D/g, ''),
          telefone: formData.telefone.replace(/\D/g, ''),
        }),
      })

      const resultado = await response.json()

      if (!resultado.success) {
        setErro(resultado.error || 'Erro ao criar empresa')
        return
      }

      setSucesso(`Empresa "${resultado.data.empresa.nome}" criada com sucesso!`)

      // Limpar campos após criação bem sucedida
      setFormData(initialFormState)
      setErrosValidacao({})

      // Atualiza a lista e mantém a mensagem de sucesso por um curto período
      setTimeout(() => {
        router.refresh()
      }, 1200)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-[#0A0E27] rounded-lg border border-[#1e2a5e] overflow-hidden">
        <div className="bg-gradient-to-r from-[#00D4FF] to-[#0066FF] px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Cadastrar Nova Empresa</h1>
          <p className="text-white/70 mt-1">Crie uma nova empresa no sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alertas */}
          {erro && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-success">
              {sucesso}
            </div>
          )}

          {/* Linha 1: Nome */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Tech Solutions"
              className={`w-full px-4 py-2 bg-[#111633] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 text-white placeholder:text-gray-500 transition-colors ${
                errosValidacao.nome ? 'border-red-500' : 'border-[#1e2a5e] focus:border-[#00D4FF]'
              }`}
            />
            {errosValidacao.nome && <p className="text-destructive text-sm mt-1">{errosValidacao.nome}</p>}
          </div>

          {/* Linha 2: CNPJ e Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                maxLength={18}
                className={`w-full px-4 py-2 bg-[#111633] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 text-white placeholder:text-gray-500 transition-colors ${
                  errosValidacao.cnpj ? 'border-red-500' : 'border-[#1e2a5e] focus:border-[#00D4FF]'
                }`}
              />
              {errosValidacao.cnpj && (
                <p className="text-destructive text-sm mt-1">{errosValidacao.cnpj}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Área de Atuação *
              </label>
              <select
                name="area_atuacao"
                value={formData.area_atuacao}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#111633] border border-[#1e2a5e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:border-[#00D4FF] text-white transition-colors"
              >
                {areasAtuacao.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Plano */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Plano *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['starter', 'profissional', 'enterprise'].map((plano) => (
                <label key={plano} className="relative">
                  <input
                    type="radio"
                    name="plano"
                    value={plano}
                    checked={formData.plano === plano}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.plano === plano
                        ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                        : 'border-[#1e2a5e] hover:border-[#00D4FF]/50 bg-[#111633]'
                    }`}
                  >
                    <div className="font-semibold text-white">
                      {planosInfo[plano].nome}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      R$ {planosInfo[plano].preco === 0 ? 'Customizado' : planosInfo[plano].preco}/mês
                    </div>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>✓ {planosInfo[plano].vagas_limite} vagas</li>
                      <li>✓ {planosInfo[plano].usuarios_limite} usuários</li>
                    </ul>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Linha 4: Email Admin */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email do Administrador *
            </label>
            <input
              type="email"
              name="email_admin"
              value={formData.email_admin}
              onChange={handleChange}
              placeholder="admin@empresa.com"
              className={`w-full px-4 py-2 bg-[#111633] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 text-white placeholder:text-gray-500 transition-colors ${
                errosValidacao.email_admin ? 'border-red-500' : 'border-[#1e2a5e] focus:border-[#00D4FF]'
              }`}
            />
            {errosValidacao.email_admin && (
              <p className="text-destructive text-sm mt-1">{errosValidacao.email_admin}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Este será o login inicial do administrador
            </p>
          </div>

          {/* Linha 5: Senha */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Senha *
            </label>
            <input
              type="password"
              name="senha_admin"
              value={formData.senha_admin}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              className={`w-full px-4 py-2 bg-[#111633] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 text-white placeholder:text-gray-500 transition-colors ${
                errosValidacao.senha_admin ? 'border-red-500' : 'border-[#1e2a5e] focus:border-[#00D4FF]'
              }`}
            />
            {errosValidacao.senha_admin && (
              <p className="text-destructive text-sm mt-1">{errosValidacao.senha_admin}</p>
            )}
            <PasswordStrength password={formData.senha_admin} />
          </div>

          {/* Linha 6: Email de Contato */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email de Contato (opcional)
            </label>
            <input
              type="email"
              name="email_contato"
              value={formData.email_contato}
              onChange={handleChange}
              placeholder="contato@empresa.com"
              className={`w-full px-4 py-2 bg-[#111633] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 text-white placeholder:text-gray-500 transition-colors ${
                errosValidacao.email_contato ? 'border-red-500' : 'border-[#1e2a5e] focus:border-[#00D4FF]'
              }`}
            />
            {errosValidacao.email_contato && (
              <p className="text-destructive text-sm mt-1">{errosValidacao.email_contato}</p>
            )}
          </div>

          {/* Linha 7: Telefone */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Telefone (opcional)
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              className={`w-full px-4 py-2 bg-[#111633] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 text-white placeholder:text-gray-500 transition-colors ${
                errosValidacao.telefone ? 'border-red-500' : 'border-[#1e2a5e] focus:border-[#00D4FF]'
              }`}
            />
            {errosValidacao.telefone && (
              <p className="text-destructive text-sm mt-1">{errosValidacao.telefone}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4 justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-56 md:w-72 px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Criando...' : 'Criar Empresa'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-56 md:w-72 px-6 py-3 bg-[#111633] border border-[#1e2a5e] text-white font-medium rounded-lg hover:bg-[#1e2a5e]/50 transition-colors"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>

      {/* Preview do plano selecionado (aparece apenas onde o usuário seleciona) */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Detalhes do Plano Selecionado</h2>
        <div className="bg-[#0A0E27] rounded-lg border border-[#1e2a5e] p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="font-bold text-2xl text-white">{planosInfo[formData.plano].nome}</h3>
              <p className="text-sm text-gray-400 mt-2">{planosInfo[formData.plano].descricao}</p>
              <div className="text-sm text-gray-400 mt-3">
                <div>Preço: <span className="font-medium text-white">R$ {planosInfo[formData.plano].preco === 0 ? 'Customizado' : planosInfo[formData.plano].preco}/mês</span></div>
                <div className="mt-2">Limites:</div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>✓ {planosInfo[formData.plano].vagas_limite} vagas</li>
                  <li>✓ {planosInfo[formData.plano].usuarios_limite} usuários</li>
                </ul>
              </div>
            </div>
            <div className="min-w-[220px]">
              <div className="text-sm text-gray-400">Principais recursos</div>
              <ul className="mt-3 space-y-2 text-sm">
                {planosInfo[formData.plano].features.map((f, i) => (
                  <li key={i} className="text-gray-400">✓ {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
