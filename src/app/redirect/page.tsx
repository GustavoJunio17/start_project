'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, getHomePath } from '@/hooks/useAuth'

export default function RedirectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (redirectedRef.current || loading) return

    redirectedRef.current = true
    
    if (user) {
      router.replace(getHomePath(user.role))
    } else {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E27' }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        border: '2px solid #00D4FF', 
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
