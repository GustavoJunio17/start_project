-- =============================================
-- Migration: Seed de Templates DISC Padrões
-- Cria 3 templates com 10, 16 e 20 questões DISC
-- =============================================

-- Para este seed, vamos usar a primeira empresa criada no sistema
-- Se nenhuma empresa existir, o script não insere nada (seguro)

DO $$
DECLARE
  empresa_id UUID;
  q_ids UUID[];
  q_id UUID;
  i INT;
BEGIN
  -- Pega a primeira empresa (se existir)
  SELECT id INTO empresa_id FROM empresas LIMIT 1;

  IF empresa_id IS NULL THEN
    RAISE NOTICE 'Nenhuma empresa encontrada. Pulando seed de templates.';
    RETURN;
  END IF;

  -- =============================================
  -- TEMPLATE 10 QUESTÕES
  -- =============================================
  q_ids := '{}';

  -- Questão 1
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Em reuniões, você prefere:', jsonb_build_array(
    jsonb_build_object('texto', 'Tomar decisões rápidas', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Inspirar e motivar as pessoas', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Ouvir todos com paciência', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Analisar dados detalhadamente', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 2
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Sob pressão, você tende a:', jsonb_build_array(
    jsonb_build_object('texto', 'Agir com determinação', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Manter a calma e otimismo', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Apoiar colegas em dificuldade', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Revisar processos cuidadosamente', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 3
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Como você prefere trabalhar:', jsonb_build_array(
    jsonb_build_object('texto', 'Liderando o projeto', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Compartilhando ideias criativas', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Em equipe harmoniosamente', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Seguindo processos estabelecidos', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 4
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Seus colegas o descrevem como:', jsonb_build_array(
    jsonb_build_object('texto', 'Direto e competitivo', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Entusiasmado e comunicativo', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Leal e confiável', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Atencioso com detalhes', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 5
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Ao aprender algo novo, você:', jsonb_build_array(
    jsonb_build_object('texto', 'Quer logo colocar em prática', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Fica empolgado com as possibilidades', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Gosta de entender com calma', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Precisa de explicações precisas', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 6
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Quanto a mudanças, você:', jsonb_build_array(
    jsonb_build_object('texto', 'Abraça desafios novos rapidamente', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Vê oportunidades de crescimento', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Prefere estabilidade e segurança', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Quer entender cada mudança bem', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 7
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Em conflitos, você normalmente:', jsonb_build_array(
    jsonb_build_object('texto', 'Enfrenta direto o problema', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Tenta encontrar uma solução criativa', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Busca harmonia e consenso', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Analisas os fatos antes de agir', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 8
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Você se sente realizado quando:', jsonb_build_array(
    jsonb_build_object('texto', 'Atinge seus objetivos ambiciosos', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Inspira e motiva outras pessoas', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Contribui para um grupo unido', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Completa tarefas com excelência', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 9
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Sua abordagem ao planejamento é:', jsonb_build_array(
    jsonb_build_object('texto', 'Focar no resultado final rápido', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Pensar em estratégias inovadoras', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Incluir todos no processo', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Planejar cada detalhe minuciosamente', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Questão 10
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Com feedback crítico, você tende a:', jsonb_build_array(
    jsonb_build_object('texto', 'Discordar se achar injusto', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Ver como oportunidade de crescimento', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Apreciar se dado com gentileza', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Querer dados específicos e evidências', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Criar template com 10 questões
  INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids) VALUES
  (empresa_id, 'DISC Rápido - 10 Questões', 'Avaliação DISC simplificada com 10 questões - ideal para triagem inicial', q_ids);

  -- =============================================
  -- TEMPLATE 16 QUESTÕES
  -- =============================================
  q_ids := '{}';

  FOR i IN 1..6 LOOP
    INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
    (empresa_id, 'Questão ' || i || ' - Cenário completo:', jsonb_build_array(
      jsonb_build_object('texto', 'Tomar ação decisiva', 'dimensao', 'D'),
      jsonb_build_object('texto', 'Explorar possibilidades', 'dimensao', 'I'),
      jsonb_build_object('texto', 'Considerar impacto nas pessoas', 'dimensao', 'S'),
      jsonb_build_object('texto', 'Verificar qualidade e conformidade', 'dimensao', 'C')
    )) RETURNING id INTO q_id;
    q_ids := array_append(q_ids, q_id);
  END LOOP;

  -- Questão 11-16: variações de contexto
  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Em uma crise organizacional:', jsonb_build_array(
    jsonb_build_object('texto', 'Assume o controle da situação', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Comunica otimismo à equipe', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Apoia colegas em dificuldade', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Identifica raiz do problema', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Relação com autoridade:', jsonb_build_array(
    jsonb_build_object('texto', 'Questiona se discordar', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Mantém relacionamento positivo', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Respeita hierarquia', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Segue protocolos estabelecidos', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Seu ambiente ideal de trabalho é:', jsonb_build_array(
    jsonb_build_object('texto', 'Competitivo e desafiador', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Criativo e colaborativo', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Estável e previsível', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Organizado e estruturado', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Para alcançar metas, você:', jsonb_build_array(
    jsonb_build_object('texto', 'Vai além dos limites', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Motiva a equipe', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Trabalha de forma sustentável', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Segue processos eficientes', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Quando há mudança de plano:', jsonb_build_array(
    jsonb_build_object('texto', 'Adapta-se rapidamente e move adiante', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Vê nova oportunidade excitante', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Quer apoio da equipe', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Precisa entender a razão', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (empresa_id, 'Comunicação preferida:', jsonb_build_array(
    jsonb_build_object('texto', 'Direto e objetivo', 'dimensao', 'D'),
    jsonb_build_object('texto', 'Envolvente e positiva', 'dimensao', 'I'),
    jsonb_build_object('texto', 'Empática e atenciosa', 'dimensao', 'S'),
    jsonb_build_object('texto', 'Precisa e documentada', 'dimensao', 'C')
  )) RETURNING id INTO q_id;
  q_ids := array_append(q_ids, q_id);

  -- Criar template com 16 questões
  INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids) VALUES
  (empresa_id, 'DISC Padrão - 16 Questões', 'Avaliação DISC completa com 16 questões - recomendado para seleção', q_ids);

  -- =============================================
  -- TEMPLATE 20 QUESTÕES
  -- =============================================
  q_ids := '{}';

  FOR i IN 1..20 LOOP
    INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
    (empresa_id, 'Situação ' || i || ' - Qual das opções melhor descreve você:', jsonb_build_array(
      jsonb_build_object('texto', 'Você é direto, ambicioso e focado em resultados', 'dimensao', 'D'),
      jsonb_build_object('texto', 'Você é criativo, otimista e inspirador', 'dimensao', 'I'),
      jsonb_build_object('texto', 'Você é leal, paciente e cooperativo', 'dimensao', 'S'),
      jsonb_build_object('texto', 'Você é preciso, cuidadoso e meticuloso', 'dimensao', 'C')
    )) RETURNING id INTO q_id;
    q_ids := array_append(q_ids, q_id);
  END LOOP;

  -- Criar template com 20 questões
  INSERT INTO templates_testes (empresa_id, nome, descricao, questoes_ids) VALUES
  (empresa_id, 'DISC Completo - 20 Questões', 'Avaliação DISC detalhada com 20 questões - ideal para análise aprofundada', q_ids);

  RAISE NOTICE 'Templates DISC criados com sucesso!';
  RAISE NOTICE '✓ Template 10 questões: DISC Rápido';
  RAISE NOTICE '✓ Template 16 questões: DISC Padrão';
  RAISE NOTICE '✓ Template 20 questões: DISC Completo';

END $$;
