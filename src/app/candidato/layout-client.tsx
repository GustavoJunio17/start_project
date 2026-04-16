'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { RoleGuard } from '@/components/security/RoleGuard'

export function CandidatoLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['candidato']}>
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  )
}
