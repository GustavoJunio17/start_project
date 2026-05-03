/**
 * Componentes React para proteger e controlar acesso baseado em roles
 * Use estes componentes para criar interfaces dinâmicas baseado no usuário
 */

'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/database'
import { canManageVagas, canManageCandidatos, isEmpresaAdmin } from '@/lib/auth/permissions'
import { ReactNode } from 'react'

interface ProtectedComponentProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
}

/**
 * Componente para proteger content por role
 * @example
 * <ProtectedByRole allowedRoles={['admin', 'gestor_rh']}>
 *   <h1>Apenas admin e gestor_rh veem isto</h1>
 * </ProtectedByRole>
 */
export function ProtectedByRole({
  children,
  allowedRoles,
  fallback,
}: ProtectedComponentProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>
    return null
  }

  return <>{children}</>
}

/**
 * Componente condicional: renderiza se o usuário pode gerenciar vagas
 */
export function IfCanManageVagas({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading || !user || !canManageVagas(user.role as any)) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente condicional: renderiza se o usuário pode gerenciar candidatos
 */
export function IfCanManageCandidatos({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading || !user || !canManageCandidatos(user.role as any)) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente condicional: renderiza se é um empresário de admin
 */
export function IfIsEmpresaAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading || !user || !isEmpresaAdmin(user.role as any)) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente condicional: renderiza se é super admin/super gestor
 */
export function IfIsSuperAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading || !user || (user.role !== 'super_admin' && user.role !== 'super_gestor')) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente condicional: renderiza se é candidato
 */
export function IfIsCandidato({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading || !user || user.role !== 'candidato') {
    return null
  }

  return <>{children}</>
}

/**
 * Componente para exibir acesso negado
 */
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
        <p className="text-gray-600">
          {message || 'Você não tem permissão para acessar este recurso.'}
        </p>
      </div>
    </div>
  )
}

/**
 * Wrapper para botões que respeita permissões
 */
interface ProtectedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredRoles?: Role[]
  requiredPermission?: 'vagas' | 'candidatos' | 'empresa' | 'users'
  children: ReactNode
}

export function ProtectedButton({
  requiredRoles,
  requiredPermission,
  children,
  onClick,
  disabled,
  ...props
}: ProtectedButtonProps) {
  const { user } = useAuth()

  let isDisabled = disabled

  if (!user) {
    isDisabled = true
  } else if (requiredRoles && !requiredRoles.includes(user.role)) {
    isDisabled = true
  } else if (requiredPermission === 'vagas' && !canManageVagas(user.role as any)) {
    isDisabled = true
  } else if (requiredPermission === 'candidatos' && !canManageCandidatos(user.role as any)) {
    isDisabled = true
  }

  return (
    <button {...props} disabled={isDisabled} onClick={onClick}>
      {children}
    </button>
  )
}

/**
 * Componente para mostrar role do usuário
 */
export function UserRoleBadge() {
  const { user, loading } = useAuth()

  if (loading) return <div className="animate-pulse">Carregando...</div>
  if (!user) return <div>Não autenticado</div>

  const roleLabels: Record<Role, string> = {
    super_admin: 'Super Admin',
    super_gestor: 'Super Gestor',
    admin: 'Admin da Empresa',
    gestor_rh: 'Gestor RH',
    colaborador: 'Colaborador',
    candidato: 'Candidato',
  }

  const roleColors: Record<Role, string> = {
    super_admin: 'bg-red-100 text-red-800',
    super_gestor: 'bg-orange-100 text-orange-800',
    admin: 'bg-blue-100 text-blue-800',
    gestor_rh: 'bg-purple-100 text-purple-800',
    colaborador: 'bg-green-100 text-green-800',
    candidato: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
      {roleLabels[user.role]}
    </span>
  )
}

/**
 * Exemplo de uso em página de criação de vaga
 */
export function CriarVagaPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <ProtectedByRole
      allowedRoles={['super_admin', 'super_gestor', 'admin', 'gestor_rh']}
      fallback={<AccessDenied message="Apenas admins e gestores RH podem criar vagas" />}
    >
      <div>
        <h1>Criar Nova Vaga</h1>
        <form>
          {/* Form fields */}
        </form>
      </div>
    </ProtectedByRole>
  )
}

/**
 * Exemplo de uso em página de candidatos
 */
export function ListarCandidatosPage({ vagaId }: { vagaId: string }) {
  const { user } = useAuth()

  return (
    <>
      <h1>Candidatos</h1>
      
      {/* Mostrar apenas para pessoas autorizadas */}
      <IfCanManageCandidatos>
        <div className="border-t pt-4">
          <h2>Ações de Gerenciador</h2>
          {/* Botões de edição */}
        </div>
      </IfCanManageCandidatos>

      {/* Mostrar para candidato suas próprias candidaturas */}
      <IfIsCandidato>
        <div className="border-t pt-4">
          <h2>Minhas Candidaturas</h2>
          {/* Listar candidaturas do usuário */}
        </div>
      </IfIsCandidato>
    </>
  )
}

/**
 * Exemplo de navbar com opções dinâmicas
 */
export function Navbar() {
  const { user } = useAuth()

  return (
    <nav className="border-b">
      <div className="flex items-center justify-between p-4">
        <h1 className="font-bold">START</h1>

        <div className="flex gap-4">
          {/* Mostrar para super admins */}
          <IfIsSuperAdmin>
            <Link href="/admin/empresas">Empresas</Link>
          </IfIsSuperAdmin>

          {/* Mostrar para gerenciadores de vagas */}
          <IfCanManageVagas>
            <Link href="/vagas">Vagas</Link>
            <Link href="/candidatos">Candidatos</Link>
          </IfCanManageVagas>

          {/* Mostrar para candidatos */}
          <IfIsCandidato>
            <Link href="/vagas">Vagas Disponíveis</Link>
            <Link href="/minhas-candidaturas">Minhas Candidaturas</Link>
          </IfIsCandidato>

          {/* Mostrar para todos autenticados */}
          {user && (
            <>
              <div><UserRoleBadge /></div>
              <a href="/perfil">Meu Perfil</a>
              <button onClick={() => {
                // logout
              }}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/**
 * Exemplo de dashboard com diferentes views por role
 */
export function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Carregando dashboard...</div>
  }

  if (!user) {
    return <AccessDenied />
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Bem-vindo, {user.nome_completo}!</div>
      <UserRoleBadge />

      {/* Super Admin */}
      <ProtectedByRole allowedRoles={['super_admin', 'super_gestor']}>
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h2>Visão SaaS</h2>
          <p>Total de empresas, vagas, no sistema</p>
        </div>
      </ProtectedByRole>

      {/* Admin/Gestor RH */}
      <ProtectedByRole allowedRoles={['admin', 'gestor_rh']}>
        <div className="mt-8 p-4 bg-purple-50 rounded">
          <h2>Dashboard da Empresa</h2>
          <p>Vagas abertas, candidatos pendentes, etc</p>
        </div>
      </ProtectedByRole>

      {/* Candidato */}
      <ProtectedByRole allowedRoles={['candidato']}>
        <div className="mt-8 p-4 bg-green-50 rounded">
          <h2>Minhas Oportunidades</h2>
          <p>Vagas recomendadas, minhas candidaturas</p>
        </div>
      </ProtectedByRole>
    </div>
  )
}
