'use client'

import { useEffect, useState, useRef } from 'react'
import type { User, Role } from '@/types/database'

export function useAuth() {
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
          const json = await res.json()
          setUser(json.data || json.user)
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

  const signOut = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .catch(error => console.error('Logout error:', error))
    setUser(null)
  }

  const refetch = async () => {
    try {
      const res = await fetch('/api/auth/me', { 
        credentials: 'include',
        cache: 'no-store'
      })
      if (res.ok) {
        const json = await res.json()
        setUser(json.data || json.user)
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
  admin: 3,
  gestor_rh: 4,
  colaborador: 5,
  candidato: 6,
}

export function canManageRole(currentRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[currentRole] < ROLE_HIERARCHY[targetRole]
}

export function isAdminRole(role: Role): boolean {
  return role === 'super_admin' || role === 'super_gestor' || role === 'admin'
}

export function getHomePath(role: Role): string {
  switch (role) {
    case 'super_admin':
    case 'super_gestor':
      return '/admin/dashboard'
    case 'admin':
    case 'gestor_rh':
      return '/empresa/dashboard'
    case 'colaborador':
      return '/gestor/dashboard'
    case 'candidato':
      return '/candidato/dashboard'
    default:
      return '/auth/login'
  }
}
