import { PoolClient } from 'pg'
import { DEFAULT_DISC_QUESTIONS } from './default-questions'

export async function createDefaultDiscTest(client: PoolClient, empresaId: string) {
  // Insert all default DISC questions
  const questionIds: string[] = []

  for (const question of DEFAULT_DISC_QUESTIONS) {
    const { rows } = await client.query(
      `INSERT INTO questoes_disc (empresa_id, pergunta, opcoes)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [empresaId, question.pergunta, JSON.stringify(question.opcoes)],
    )
    if (rows.length > 0) {
      questionIds.push(rows[0].id)
    }
  }

  // Create template with all questions
  const templateName = 'Teste DISC Padrão'

  const { rows: templateRows } = await client.query(
    `INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome`,
    [
      empresaId,
      templateName,
      'Teste DISC padrão com 20 questões - 5 por dimensão (D, I, S, C)',
      JSON.stringify(questionIds),
    ],
  )

  return {
    templateId: templateRows[0]?.id,
    templateName: templateRows[0]?.nome,
    questionsCount: questionIds.length,
  }
}
