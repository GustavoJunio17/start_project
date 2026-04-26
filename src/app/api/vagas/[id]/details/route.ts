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

    if (error || !data) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    return NextResponse.json({ error: 'Erro ao buscar vaga' }, { status: 500 })
  }
}
