'use client'

import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/database'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  allowedRoles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground mt-2">
            Voce nao tem permissao para acessar esta pagina.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
