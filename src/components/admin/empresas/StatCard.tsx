'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-[#0A0E27] border border-[#1e2a5e] rounded-xl p-6 transition-colors hover:border-[#00D4FF]/50 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-semibold text-white mt-1">{value}</p>
        </div>
        {icon && <div className="text-[#00D4FF]">{icon}</div>}
      </div>

      {(description || trend) && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1e2a5e]">
          {description && <p className="text-xs text-gray-400">{description}</p>}
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.direction === 'up'
                  ? 'text-green-500'
                  : trend.direction === 'down'
                    ? 'text-red-500'
                    : 'text-gray-400'
              }`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
