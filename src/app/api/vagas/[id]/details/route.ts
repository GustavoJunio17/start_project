import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: vagaId } = await params
    const db = createServerClient()

    const { data, error } = await db
      .from('vagas')
      .select('*, empresa:empresas(nome)')
      .eq('id', vagaId)
      .single()

    if (error || !data || data.status === 'rascunho') {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 })
    }

    // Fechar automaticamente se data_limite já passou (antes do cron rodar)
    if (data.status === 'aberta' && data.data_limite) {
      const limitDate = new Date(data.data_limite as string | Date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (limitDate < today) {
        await db.from('vagas').update({ status: 'encerrada' }).eq('id', vagaId)
        data.status = 'encerrada'
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    return NextResponse.json({ error: 'Erro ao buscar vaga' }, { status: 500 })
  }
}
