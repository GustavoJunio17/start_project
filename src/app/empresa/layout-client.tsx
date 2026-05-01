'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { RoleGuard } from '@/components/security/RoleGuard'

export function EmpresaLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['user_empresa', 'gestor_rh', 'admin']}>
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  )
}
