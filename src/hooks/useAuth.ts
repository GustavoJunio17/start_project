'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Role } from '@/types/database'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let aborted = false

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store'
        })

        if (aborted) return

        if (res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const json = await res.json()
            setUser(json.data || json.user || json)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth fetch error:', error)
        setUser(null)
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    fetchUser()

    return () => {
      aborted = true
    }
  }, [])

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/auth/login')
      router.refresh()
    }
  }

  const refetch = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      if (res.ok) {
        const contentType = res.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const json = await res.json()
          setUser(json.data || json.user || json)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth refetch error:', error)
      setUser(null)
    }
  }

  return { user, loading, signOut, refetch }
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 1,
  super_gestor: 2,
  admin: 2,
  user_empresa: 3,
  gestor_rh: 4,
  colaborador: 5,
  candidato: 6,
}

export function canManageRole(currentRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[currentRole] < ROLE_HIERARCHY[targetRole]
}

export function isAdminRole(role: Role): boolean {
  return role === 'super_admin' || role === 'super_gestor' || role === 'user_empresa'
}

export function getHomePath(role: Role): string {
  switch (role) {
    case 'super_admin':
    case 'super_gestor':
      return '/admin/dashboard'
    case 'user_empresa':
    case 'gestor_rh':
      return '/empresa/dashboard'
    case 'colaborador':
      return '/gestor/dashboard'
    case 'candidato':
      return '/candidato/dashboard'
    default:
      return '/admin/dashboard'
  }
}
