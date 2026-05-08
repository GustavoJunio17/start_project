'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { RoleGuard } from '@/components/security/RoleGuard'
import { Toaster } from 'sonner'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['super_admin', 'super_gestor']}>
      <AppLayout>{children}</AppLayout>
      <Toaster richColors position="top-right" />
    </RoleGuard>
  )
}
