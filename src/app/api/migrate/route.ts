import pool from '@/lib/db/pool'

export async function POST(req: Request) {
  const client = await pool.connect()

  try {
    console.log('🔄 Iniciando migração...')

    // Verificar se 'rascunho' já existe
    const checkEnum = await client.query(`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = 'status_vaga'::regtype
      AND enumlabel = 'rascunho'
    `)

    if (checkEnum.rows.length > 0) {
      return Response.json({
        success: true,
        message: '✅ Status "rascunho" já existe!'
      })
    }

    console.log('📝 Adicionando "rascunho" ao enum...')

    await client.query(`
      CREATE TYPE status_vaga_new AS ENUM ('rascunho', 'aberta', 'pausada', 'encerrada')
    `)

    await client.query(`
      ALTER TABLE vagas ALTER COLUMN status TYPE status_vaga_new USING status::text::status_vaga_new
    `)

    await client.query(`DROP TYPE status_vaga`)

    await client.query(`ALTER TYPE status_vaga_new RENAME TO status_vaga`)

    await client.query(`
      ALTER TABLE vagas ALTER COLUMN status SET DEFAULT 'rascunho'
    `)

    console.log('🎉 Migração concluída!')

    return Response.json({
      success: true,
      message: '✅ Migração concluída com sucesso!'
    })

  } catch (error: any) {
    console.error('❌ Erro na migração:', error.message)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  } finally {
    client.release()
  }
}
