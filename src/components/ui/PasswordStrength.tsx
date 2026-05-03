'use client'

import { validatePassword } from '@/lib/utils/masks'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  if (!password) return null
  const { errors } = validatePassword(password)

  return (
    <ul className={`mt-2 space-y-1 ${className}`}>
      {errors.map(({ label, ok }) => (
        <li key={label} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-emerald-500' : 'text-gray-500'}`}>
          {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
          {label}
        </li>
      ))}
    </ul>
  )
}
