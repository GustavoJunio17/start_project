'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  cta?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-[#1e2a5e] bg-[#0A0E27]/50 px-6 py-16 text-center md:py-24">
      <div className="space-y-4">
        {icon && <div className="flex justify-center text-4xl text-[#00D4FF]/40">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-sm">{description}</p>
        </div>
        {cta && (
          <Link
            href={cta.href}
            className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white font-medium rounded-lg hover:opacity-90 transition"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  )
}
