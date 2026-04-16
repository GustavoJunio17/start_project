'use client'

import { Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  useTheme(user?.tema_preferido)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E27]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" />
      </div>
    )
  }

  if (!user) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#0A0E27] theme-clean:bg-[#F8FAFC]">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
