'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'
import type { PerfilDISC } from '@/types/database'

interface DISCChartProps {
  perfil: PerfilDISC
  perfilIdeal?: PerfilDISC
  size?: number
}

export function DISCChart({ perfil, perfilIdeal, size = 300 }: DISCChartProps) {
  const data = [
    { dim: 'D - Dominancia', candidato: perfil.D, ideal: perfilIdeal?.D },
    { dim: 'I - Influencia', candidato: perfil.I, ideal: perfilIdeal?.I },
    { dim: 'S - Estabilidade', candidato: perfil.S, ideal: perfilIdeal?.S },
    { dim: 'C - Conformidade', candidato: perfil.C, ideal: perfilIdeal?.C },
  ]

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid stroke="#1e2a5e" />
        <PolarAngleAxis dataKey="dim" tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
        <Radar
          name="Candidato"
          dataKey="candidato"
          stroke="#00D4FF"
          fill="#00D4FF"
          fillOpacity={0.3}
        />
        {perfilIdeal && (
          <Radar
            name="Perfil Ideal"
            dataKey="ideal"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.15}
          />
        )}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function DISCBars({ perfil }: { perfil: PerfilDISC }) {
  const dims = [
    { key: 'D', label: 'Dominancia', color: '#EF4444', value: perfil.D },
    { key: 'I', label: 'Influencia', color: '#F59E0B', value: perfil.I },
    { key: 'S', label: 'Estabilidade', color: '#10B981', value: perfil.S },
    { key: 'C', label: 'Conformidade', color: '#0066FF', value: perfil.C },
  ]

  return (
    <div className="space-y-3">
      {dims.map((d) => (
        <div key={d.key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{d.key} - {d.label}</span>
            <span className="font-medium text-foreground">{d.value}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${d.value}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
