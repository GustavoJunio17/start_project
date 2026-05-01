import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { createServerClient } from '@/lib/db/server'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.empresa_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServerClient()
  const { data, error } = await db
    .from('templates_testes')
    .select('id, nome, descricao')
    .eq('empresa_id', user.empresa_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
