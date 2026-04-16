'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

const COLORS = ['#00D4FF', '#0066FF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']

export default function RelatoriosPage() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    statusDist: { name: string; value: number }[]
    classifDist: { name: string; value: number }[]
  }>({ statusDist: [], classifDist: [] })
  const supabase = createClient()

  useEffect(() => {
    if (!user?.empresa_id) return
    async function load() {
      const { data: candidatos } = await supabase
        .from('candidatos')
        .select('status_candidatura, classificacao')
        .eq('empresa_id', user!.empresa_id!)

      if (!candidatos) return

      const statusMap: Record<string, number> = {}
      const classifMap: Record<string, number> = {}
      candidatos.forEach(c => {
        statusMap[c.status_candidatura] = (statusMap[c.status_candidatura] || 0) + 1
        if (c.classificacao) classifMap[c.classificacao] = (classifMap[c.classificacao] || 0) + 1
      })

      setData({
        statusDist: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
        classifDist: Object.entries(classifMap).map(([name, value]) => ({ name, value })),
      })
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#00D4FF]" /> Relatorios
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Candidatos por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.statusDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a5e" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Classificacao</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.classifDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {data.classifDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
