import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/session'
import { buildAndRunQuery } from '@/lib/db/query-executor'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ data: null, error: { message: 'Nao autenticado' }, count: null }, { status: 401 })
  }

  const desc = await request.json()
  const result = await buildAndRunQuery(desc)

  return NextResponse.json(result)
}
