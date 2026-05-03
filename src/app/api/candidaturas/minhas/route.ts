import { NextResponse } from 'next/server'
import { requireRole, withErrorHandler } from '@/lib/auth/api-helpers'
import pool from '@/lib/db/pool'

export const GET = withErrorHandler(async () => {
  const user = await requireRole(['candidato'])

  const { rows } = await pool.query(
    `SELECT
      c.id,
      c.vaga_id,
      c.status,
      c.created_at,
      c.curriculo_nome,
      c.linkedin,
      c.pretensao_salarial,
      c.mensagem,
      v.titulo        AS vaga_titulo,
      v.categoria     AS vaga_categoria,
      v.descricao     AS vaga_descricao,
      v.requisitos    AS vaga_requisitos,
      e.nome          AS empresa_nome
    FROM candidaturas c
    LEFT JOIN vagas v ON v.id = c.vaga_id
    LEFT JOIN empresas e ON e.id = v.empresa_id
    WHERE c.email = $1
    ORDER BY c.created_at DESC`,
    [user.email]
  )

  return NextResponse.json({ data: rows })
})
