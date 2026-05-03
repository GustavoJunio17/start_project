const pool = require('pg').Pool
require('dotenv').config()

const dbPool = new pool({ connectionString: process.env.DATABASE_URL })

async function deleteExamples() {
  try {
    console.log('🗑️  Iniciando exclusão de exemplos...')
    console.log('⚠️  AVISO: Isto irá deletar todos os dados de exemplo criados\n')

    // Encontrar a empresa de exemplo
    const empresaResult = await dbPool.query(
      `SELECT id FROM empresas WHERE nome = 'Tech Solutions Brasil' LIMIT 1`
    )

    if (empresaResult.rows.length === 0) {
      console.log('ℹ️  Nenhuma empresa de exemplo encontrada')
      await dbPool.end()
      return
    }

    const empresaId = empresaResult.rows[0].id
    console.log(`Encontrada empresa de exemplo: ${empresaId}`)

    // Encontrar usuários de exemplo
    const usersResult = await dbPool.query(
      `SELECT id FROM users
       WHERE empresa_id = $1
          OR email IN ('admin@techsolutions.com.br', 'gestor@techsolutions.com.br', 'candidato@email.com')`,
      [empresaId]
    )
    const userIds = usersResult.rows.map(u => u.id)
    console.log(`Encontrados ${userIds.length} usuários de exemplo`)

    // Delete em ordem de foreign keys
    let deletedCount = 0

    // 1. Deletar agendamentos
    const agendResult = await dbPool.query(
      `DELETE FROM agendamentos WHERE empresa_id = $1`,
      [empresaId]
    )
    deletedCount += agendResult.rowCount
    console.log(`✓ ${agendResult.rowCount} agendamentos deletados`)

    // 2. Deletar feedbacks
    const feedResult = await dbPool.query(
      `DELETE FROM feedbacks WHERE empresa_id = $1`,
      [empresaId]
    )
    deletedCount += feedResult.rowCount
    console.log(`✓ ${feedResult.rowCount} feedbacks deletados`)

    // 3. Deletar respostas de teste
    const respostasResult = await dbPool.query(
      `DELETE FROM respostas_teste
       WHERE candidato_id IN (
         SELECT id FROM candidatos WHERE empresa_id = $1
       ) OR colaborador_id IN (
         SELECT id FROM colaboradores WHERE empresa_id = $1
       )`,
      [empresaId]
    )
    deletedCount += respostasResult.rowCount
    console.log(`✓ ${respostasResult.rowCount} respostas de teste deletadas`)

    // 4. Deletar candidatos
    const candidResult = await dbPool.query(
      `DELETE FROM candidatos WHERE empresa_id = $1`,
      [empresaId]
    )
    deletedCount += candidResult.rowCount
    console.log(`✓ ${candidResult.rowCount} candidatos deletados`)

    // 5. Deletar colaboradores
    const colaboResult = await dbPool.query(
      `DELETE FROM colaboradores WHERE empresa_id = $1`,
      [empresaId]
    )
    deletedCount += colaboResult.rowCount
    console.log(`✓ ${colaboResult.rowCount} colaboradores deletados`)

    // 6. Deletar vagas
    const vagasResult = await dbPool.query(
      `DELETE FROM vagas WHERE empresa_id = $1`,
      [empresaId]
    )
    deletedCount += vagasResult.rowCount
    console.log(`✓ ${vagasResult.rowCount} vagas deletadas`)

    // 7. Deletar candidaturas
    const candResult = await dbPool.query(
      `DELETE FROM candidaturas
       WHERE vaga_id IN (
         SELECT id FROM vagas WHERE empresa_id = $1
       )`,
      [empresaId]
    )
    deletedCount += candResult.rowCount
    console.log(`✓ ${candResult.rowCount} candidaturas deletadas`)

    // 8. Deletar templates de teste
    const templResult = await dbPool.query(
      `DELETE FROM template_testes WHERE empresa_id = $1`,
      [empresaId]
    )
    deletedCount += templResult.rowCount
    console.log(`✓ ${templResult.rowCount} templates de teste deletados`)

    // 9. Deletar usuários
    if (userIds.length > 0) {
      const usersDelete = await dbPool.query(
        `DELETE FROM users WHERE id = ANY($1)`,
        [userIds]
      )
      deletedCount += usersDelete.rowCount
      console.log(`✓ ${usersDelete.rowCount} usuários deletados`)
    }

    // 10. Deletar empresa
    const empresaDelete = await dbPool.query(
      `DELETE FROM empresas WHERE id = $1`,
      [empresaId]
    )
    deletedCount += empresaDelete.rowCount
    console.log(`✓ ${empresaDelete.rowCount} empresa deletada`)

    console.log(`\n✅ Exclusão concluída! Total de ${deletedCount} registros removidos`)

    await dbPool.end()
  } catch (error) {
    console.error('❌ Erro ao deletar:', error.message)
    process.exit(1)
  }
}

deleteExamples()
