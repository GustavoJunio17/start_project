import type { Role } from '@/types/database'

export interface AuthContext {
  userId: string
  role: Role
  empresaId: string | null
}

/**
 * Define o mapa de permissões por role
 */
export const rolePermissions: Record<Role, {
  canManageVagas: boolean
  canManageCandidatos: boolean
  canManageUsers: boolean
  canManageEmpresa: boolean
  isSuperAdmin: boolean
  isSuperGestor: boolean
  isAdmin: boolean
  isGestorRH: boolean
  isColaborador: boolean
  isCandidato: boolean
}> = {
  super_admin: {
    canManageVagas: true,
    canManageCandidatos: true,
    canManageUsers: true,
    canManageEmpresa: true,
    isSuperAdmin: true,
    isSuperGestor: false,
    isAdmin: false,
    isGestorRH: false,
    isColaborador: false,
    isCandidato: false,
  },
  super_gestor: {
    canManageVagas: true,
    canManageCandidatos: true,
    canManageUsers: true,
    canManageEmpresa: true,
    isSuperAdmin: false,
    isSuperGestor: true,
    isAdmin: false,
    isGestorRH: false,
    isColaborador: false,
    isCandidato: false,
  },
  admin: {
    canManageVagas: true,
    canManageCandidatos: true,
    canManageUsers: true,
    canManageEmpresa: true,
    isSuperAdmin: false,
    isSuperGestor: false,
    isAdmin: true,
    isGestorRH: false,
    isColaborador: false,
    isCandidato: false,
  },
  user_empresa: {
    canManageVagas: true,
    canManageCandidatos: true,
    canManageUsers: true,
    canManageEmpresa: true,
    isSuperAdmin: false,
    isSuperGestor: false,
    isAdmin: true,
    isGestorRH: false,
    isColaborador: false,
    isCandidato: false,
  },
  gestor_rh: {
    canManageVagas: true,
    canManageCandidatos: true,
    canManageUsers: false,
    canManageEmpresa: false,
    isSuperAdmin: false,
    isSuperGestor: false,
    isAdmin: false,
    isGestorRH: true,
    isColaborador: false,
    isCandidato: false,
  },
  colaborador: {
    canManageVagas: false,
    canManageCandidatos: false,
    canManageUsers: false,
    canManageEmpresa: false,
    isSuperAdmin: false,
    isSuperGestor: false,
    isAdmin: false,
    isGestorRH: false,
    isColaborador: true,
    isCandidato: false,
  },
  candidato: {
    canManageVagas: false,
    canManageCandidatos: false,
    canManageUsers: false,
    canManageEmpresa: false,
    isSuperAdmin: false,
    isSuperGestor: false,
    isAdmin: false,
    isGestorRH: false,
    isColaborador: false,
    isCandidato: true,
  },
}

/**
 * Verificar se o usuário tem permissão para gerenciar vagas
 */
export function canManageVagas(role: Role): boolean {
  return rolePermissions[role].canManageVagas
}

/**
 * Verificar se o usuário tem permissão para gerenciar candidatos
 */
export function canManageCandidatos(role: Role): boolean {
  return rolePermissions[role].canManageCandidatos
}

/**
 * Verificar se o usuário tem permissão para gerenciar usuários
 */
export function canManageUsers(role: Role): boolean {
  return rolePermissions[role].canManageUsers
}

/**
 * Verificar se o usuário tem permissão para gerenciar empresa
 */
export function canManageEmpresa(role: Role): boolean {
  return rolePermissions[role].canManageEmpresa
}

/**
 * Verificar se o usuário é super admin ou super gestor
 */
export function isSuperValidation(role: Role): boolean {
  return rolePermissions[role].isSuperAdmin || rolePermissions[role].isSuperGestor
}

/**
 * Verificar se o usuário é administrador da empresa (admin ou gestor_rh)
 */
export function isEmpresaAdmin(role: Role): boolean {
  return rolePermissions[role].isAdmin || rolePermissions[role].isGestorRH
}

/**
 * Retornar mensagem de erro de autorização
 */
export function getUnauthorizedMessage(): string {
  return 'Voce nao tem permissao para executar esta acao'
}
