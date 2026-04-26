import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from './session'
import type { Role } from '@/types/database'
import { canManageVagas, canManageCandidatos, canManageUsers, getUnauthorizedMessage } from './permissions'

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getServerUser>>>

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Criar resposta de sucesso
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Criar resposta de erro
 */
export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Middleware para verificar autenticação
 */
export async function requireAuth(req: NextRequest): Promise<ReturnType<typeof getServerUser>> {
  const user = await getServerUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

/**
 * Middleware para verificar permissão de gerenciar vagas
 */
export async function requirePermission<T extends Role>(
  requiredPermissionCheck: (role: T) => boolean,
  userRole: T
): Promise<void> {
  if (!requiredPermissionCheck(userRole)) {
    throw new Error('FORBIDDEN')
  }
}

/**
 * Verifica autenticação e opcionalmente restringe a roles específicas.
 * Lança 'UNAUTHORIZED' ou 'FORBIDDEN' para o withErrorHandler capturar.
 */
export async function requireRole(allowedRoles?: Role[]): Promise<AuthUser> {
  const user = await getServerUser()
  if (!user) throw new Error('UNAUTHORIZED')
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) throw new Error('FORBIDDEN')
  return user as AuthUser
}

/**
 * Wrapper para rotas da API com tratamento de erros
 * Suporta rotas com e sem dynamic params
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandler(handler: (req: NextRequest, context?: any) => Promise<NextResponse>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (message === 'UNAUTHORIZED') {
        return errorResponse('Voce precisa estar autenticado', 401)
      }

      if (message === 'FORBIDDEN') {
        return errorResponse(getUnauthorizedMessage(), 403)
      }

      console.error('API Error:', error)
      return errorResponse(message, 500)
    }
  }
}
