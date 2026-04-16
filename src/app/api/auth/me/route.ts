import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ success: false, data: null }, { status: 401 })
  }
  return NextResponse.json({ success: true, data: user })
}
