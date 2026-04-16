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
    <div className={`bg-card border border-border rounded-xl p-6 transition hover:border-primary/50 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground mt-1">{value}</p>
        </div>
        {icon && <div className="text-primary/70">{icon}</div>}
      </div>

      {(description || trend) && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.direction === 'up'
                  ? 'text-success'
                  : trend.direction === 'down'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
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
