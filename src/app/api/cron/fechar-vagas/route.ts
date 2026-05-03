import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await pool.query(`
    UPDATE vagas
    SET status = 'encerrada'
    WHERE status IN ('aberta', 'pausada')
      AND data_limite IS NOT NULL
      AND data_limite < CURRENT_DATE
    RETURNING id, titulo, data_limite
  `)

  return NextResponse.json({
    encerradas: result.rowCount,
    vagas: result.rows,
  })
}
