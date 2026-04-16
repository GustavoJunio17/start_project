import { NextRequest } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'
import bcrypt from 'bcryptjs'
import {
  validarCNPJ,
  validarEmail,
  validarSenha,
  validarNomeEmpresa,
  validarAreaAtuacao,
  gerarSlugEmpresa,
  mensagensErro,
} from '@/lib/validations/empresa'

/**
 * POST /api/admin/empresas
 * Criar nova empresa - apenas super_admin e super_gestor
 * 
 * Body:
 * {
 *   "nome": "Tech Solutions",
 *   "cnpj": "12.345.678/0001-90",
 *   "area_atuacao": "Digital",
 *   "plano": "profissional",
 *   "email_admin": "admin@techsolutions.com",
 *   "senha_admin": "SenhaForte123!",
 *   "email_contato": "contato@techsolutions.com",
 *   "telefone": "1133334444"
 * }
 */
async function handlePOST(req: NextRequest) {
  const user = await getServerUser()

  if (!user) {
    return errorResponse('Voce precisa estar autenticado', 401)
  }

  if (user.role !== 'super_admin' && user.role !== 'super_gestor') {
    return errorResponse('Apenas super_admin e super_gestor podem criar empresas', 403)
  }

  const body = await req.json()
  const {
    nome,
    cnpj,
    area_atuacao,
    plano = 'starter',
    email_admin,
    senha_admin,
    email_contato,
    telefone,
  } = body

  // ==========================================
  // VALIDAÇÕES
  // ==========================================

  if (!nome || !validarNomeEmpresa(nome)) {
    return errorResponse(mensagensErro.nome_invalido, 400)
  }

  if (!cnpj || !validarCNPJ(cnpj)) {
    return errorResponse(mensagensErro.cnpj_invalido, 400)
  }

  const cnpjLimpo = cnpj.replace(/\D/g, '')

  if (!area_atuacao || !validarAreaAtuacao(area_atuacao)) {
    return errorResponse(mensagensErro.area_invalida, 400)
  }

  if (!['starter', 'profissional', 'enterprise'].includes(plano)) {
    return errorResponse(mensagensErro.plano_invalido, 400)
  }

  if (!email_admin || !validarEmail(email_admin)) {
    return errorResponse(mensagensErro.email_invalido, 400)
  }

  if (!senha_admin) {
    return errorResponse('Senha é obrigatória', 400)
  }

  const validacaoSenha = validarSenha(senha_admin)
  if (!validacaoSenha.valida) {
    return errorResponse(`Senha fraca: ${validacaoSenha.erros.join(', ')}`, 400)
  }

  // ==========================================
  // VERIFICAR DUPLICATAS
  // ==========================================

  const cnpjExistente = await pool.query('SELECT id FROM empresas WHERE cnpj = $1', [cnpjLimpo])
  if (cnpjExistente.rows.length > 0) {
    return errorResponse(mensagensErro.cnpj_duplicado, 400)
  }

  const emailExistente = await pool.query('SELECT id FROM users WHERE email = $1', [
    email_admin,
  ])
  if (emailExistente.rows.length > 0) {
    return errorResponse(mensagensErro.email_ja_existe, 400)
  }

  // ==========================================
  // CRIAR EMPRESA
  // ==========================================

  const empresaQuery = `
    INSERT INTO empresas (
      nome,
      segmento,
      cnpj,
      email_contato,
      telefone,
      plano,
      criado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `

  let empresaResult
  try {
    empresaResult = await pool.query(empresaQuery, [
      nome,
      area_atuacao,
      cnpjLimpo,
      email_contato || null,
      telefone || null,
      plano,
      user.id,
    ])
  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return errorResponse(mensagensErro.empresa_nao_criada, 500)
  }

  const empresa = empresaResult.rows[0]

  // ==========================================
  // CRIAR USUÁRIO ADMIN DA EMPRESA
  // ==========================================

  const senhaHash = await bcrypt.hash(senha_admin, 10)

  const usuarioQuery = `
    INSERT INTO users (
      email,
      password_hash,
      nome_completo,
      role,
      empresa_id,
      empresa_nome,
      permissoes,
      ativo,
      criado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, email, nome_completo, role, empresa_id
  `

  // Permissões padrão para admin
  const permissoesAdmin = {
    vagas: { ver: true, criar: true, editar: true, excluir: true, convidar: false },
    candidatos: { ver: true, criar: true, editar: true, excluir: true, convidar: false },
    usuarios: { ver: true, criar: true, editar: true, excluir: true, convidar: true },
    empresa: { ver: true, criar: false, editar: true, excluir: false, convidar: false },
    testes: { ver: true, criar: true, editar: true, excluir: true, convidar: false },
    feedbacks: { ver: true, criar: true, editar: true, excluir: true, convidar: false },
    relatorios: { ver: true, criar: true, editar: false, excluir: false, convidar: false },
  }

  let usuarioResult
  try {
    usuarioResult = await pool.query(usuarioQuery, [
      email_admin,
      senhaHash,
      nome || email_admin.split('@')[0],
      'admin',
      empresa.id,
      nome,
      JSON.stringify(permissoesAdmin),
      true,
      user.id,
    ])
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error)
    // Tentar deletar a empresa criada
    await pool.query('DELETE FROM empresas WHERE id = $1', [empresa.id])
    return errorResponse(mensagensErro.usuario_nao_criado, 500)
  }

  const usuarioAdmin = usuarioResult.rows[0]

  // ==========================================
  // RESPOSTA
  // ==========================================

  return successResponse(
    {
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        segmento: empresa.segmento,
        plano: empresa.plano,
        status: empresa.status,
        data_cadastro: empresa.data_cadastro,
      },
      admin: {
        id: usuarioAdmin.id,
        email: usuarioAdmin.email,
        role: usuarioAdmin.role,
      },
      mensagem:
        'Empresa criada com sucesso! O usuário admin já pode fazer login com as credenciais fornecidas.',
    },
    201,
  )
}

export const POST = withErrorHandler(handlePOST)
