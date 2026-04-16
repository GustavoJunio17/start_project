'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { RoleGuard } from '@/components/security/RoleGuard'

export function GestorLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['colaborador']}>
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  )
}
