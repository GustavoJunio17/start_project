-- =============================================
-- START PRO 5.0 — Dados de Seed
-- Execute APOS o schema.sql
-- =============================================

-- Empresas
INSERT INTO empresas (id, nome, segmento, categoria, cnpj, email_contato, telefone, status) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Clinica Sorriso', 'Saude', 'Clinica Odontologica', '11.111.111/0001-01', 'contato@clinicasorriso.com', '(11) 91111-1111', 'ativa'),
  ('e1000000-0000-0000-0000-000000000002', 'SuperMart', 'Varejo', 'Supermercado', '22.222.222/0001-02', 'rh@supermart.com', '(11) 92222-2222', 'ativa'),
  ('e1000000-0000-0000-0000-000000000003', 'TechNova', 'Digital', 'Startup SaaS', '33.333.333/0001-03', 'rh@technova.io', '(11) 93333-3333', 'ativa');

-- Users (auth_id will be set after Supabase Auth signup, use placeholders)
-- Super Admin
INSERT INTO users (id, email, nome_completo, role, ativo) VALUES
  ('u1000000-0000-0000-0000-000000000001', 'backupabril18@gmail.com', 'Super Administrador', 'super_admin', true);

-- Super Gestor
INSERT INTO users (id, email, nome_completo, role, ativo) VALUES
  ('u1000000-0000-0000-0000-000000000002', 'supergestor@startpro.com', 'Ana Super Gestora', 'gestor_admin', true);

-- Empresa owners
INSERT INTO users (id, email, nome_completo, role, empresa_id, empresa_nome, ativo) VALUES
  ('u1000000-0000-0000-0000-000000000003', 'admin@clinicasorriso.com', 'Dr. Carlos Silva', 'user_empresa', 'e1000000-0000-0000-0000-000000000001', 'Clinica Sorriso', true),
  ('u1000000-0000-0000-0000-000000000004', 'admin@supermart.com', 'Maria Oliveira', 'user_empresa', 'e1000000-0000-0000-0000-000000000002', 'SuperMart', true),
  ('u1000000-0000-0000-0000-000000000005', 'admin@technova.io', 'Pedro Costa', 'user_empresa', 'e1000000-0000-0000-0000-000000000003', 'TechNova', true);

-- Gestores RH (2 per empresa)
INSERT INTO users (id, email, nome_completo, role, empresa_id, empresa_nome, ativo) VALUES
  ('u1000000-0000-0000-0000-000000000006', 'rh1@clinicasorriso.com', 'Juliana Santos', 'colaborador', 'e1000000-0000-0000-0000-000000000001', 'Clinica Sorriso', true),
  ('u1000000-0000-0000-0000-000000000007', 'rh2@clinicasorriso.com', 'Roberto Lima', 'colaborador', 'e1000000-0000-0000-0000-000000000001', 'Clinica Sorriso', true),
  ('u1000000-0000-0000-0000-000000000008', 'rh1@supermart.com', 'Fernanda Alves', 'colaborador', 'e1000000-0000-0000-0000-000000000002', 'SuperMart', true),
  ('u1000000-0000-0000-0000-000000000009', 'rh2@supermart.com', 'Lucas Ferreira', 'colaborador', 'e1000000-0000-0000-0000-000000000002', 'SuperMart', true),
  ('u1000000-0000-0000-0000-000000000010', 'rh1@technova.io', 'Camila Rocha', 'colaborador', 'e1000000-0000-0000-0000-000000000003', 'TechNova', true),
  ('u1000000-0000-0000-0000-000000000011', 'rh2@technova.io', 'Thiago Mendes', 'colaborador', 'e1000000-0000-0000-0000-000000000003', 'TechNova', true);

-- Candidatos (users)
INSERT INTO users (id, email, nome_completo, role, ativo) VALUES
  ('u1000000-0000-0000-0000-000000000020', 'candidato1@email.com', 'Joao Pereira', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000021', 'candidato2@email.com', 'Mariana Souza', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000022', 'candidato3@email.com', 'Felipe Martins', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000023', 'candidato4@email.com', 'Beatriz Gomes', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000024', 'candidato5@email.com', 'Rafael Duarte', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000025', 'candidato6@email.com', 'Isabela Nunes', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000026', 'candidato7@email.com', 'Gabriel Ribeiro', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000027', 'candidato8@email.com', 'Larissa Carvalho', 'candidato', true),
  ('u1000000-0000-0000-0000-000000000028', 'candidato9@email.com', 'Diego Fernandes', 'candidato', true);

-- Vagas (3 per empresa)
INSERT INTO vagas (id, empresa_id, titulo, descricao, requisitos, categoria, perfil_disc_ideal, status, publica) VALUES
  -- Clinica Sorriso
  ('v1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Recepcionista', 'Atendimento ao paciente na recepcao', 'Experiencia em atendimento, boa comunicacao', 'Atendimento', '{"D":15,"I":35,"S":35,"C":15}', 'aberta', true),
  ('v1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Auxiliar Financeiro', 'Gestao financeira da clinica', 'Experiencia em financeiro, Excel avancado', 'Financeiro', '{"D":20,"I":15,"S":25,"C":40}', 'aberta', true),
  ('v1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'Assistente Administrativo', 'Suporte administrativo geral', 'Organizacao e proatividade', 'Administrativo', '{"D":20,"I":25,"S":30,"C":25}', 'aberta', true),
  -- SuperMart
  ('v1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002', 'Operador de Caixa', 'Atendimento no caixa', 'Ensino medio completo', 'Atendimento', '{"D":15,"I":30,"S":40,"C":15}', 'aberta', true),
  ('v1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002', 'Vendedor', 'Vendas e atendimento ao cliente', 'Experiencia em vendas', 'Vendas', '{"D":35,"I":35,"S":15,"C":15}', 'aberta', true),
  ('v1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000002', 'Estoquista', 'Gestao de estoque e reposicao', 'Organizacao e disponibilidade', 'Operacional', '{"D":20,"I":15,"S":40,"C":25}', 'aberta', true),
  -- TechNova
  ('v1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000003', 'Desenvolvedor Frontend', 'Desenvolvimento de interfaces web', 'React, TypeScript, 2+ anos', 'Tecnologia', '{"D":25,"I":20,"S":20,"C":35}', 'aberta', true),
  ('v1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000003', 'Product Manager', 'Gestao de produto digital', 'Experiencia com metodologias ageis', 'Produto', '{"D":35,"I":30,"S":15,"C":20}', 'aberta', true),
  ('v1000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000003', 'Customer Success', 'Relacionamento com clientes', 'Experiencia com atendimento B2B', 'Atendimento', '{"D":20,"I":35,"S":30,"C":15}', 'aberta', true);

-- Candidatos (3 per empresa, with test results)
INSERT INTO candidatos (id, user_id, empresa_id, vaga_id, nome_completo, email, whatsapp, cargo_pretendido, status_candidatura, perfil_disc, match_score, classificacao, disponivel_banco_talentos, data_ultimo_teste) VALUES
  -- Clinica Sorriso
  ('c1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000020', 'e1000000-0000-0000-0000-000000000001', 'v1000000-0000-0000-0000-000000000001', 'Joao Pereira', 'candidato1@email.com', '(11) 90001-0001', 'Recepcionista', 'em_avaliacao', '{"D":20,"I":30,"S":35,"C":15}', 92, 'ouro', true, '2026-04-01'),
  ('c1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000021', 'e1000000-0000-0000-0000-000000000001', 'v1000000-0000-0000-0000-000000000002', 'Mariana Souza', 'candidato2@email.com', '(11) 90002-0002', 'Auxiliar Financeiro', 'entrevista_agendada', '{"D":15,"I":20,"S":30,"C":35}', 78, 'prata', true, '2026-04-02'),
  ('c1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000022', 'e1000000-0000-0000-0000-000000000001', 'v1000000-0000-0000-0000-000000000003', 'Felipe Martins', 'candidato3@email.com', '(11) 90003-0003', 'Assistente Admin', 'inscrito', '{"D":40,"I":15,"S":20,"C":25}', 55, 'bronze', true, '2026-04-03'),
  -- SuperMart
  ('c1000000-0000-0000-0000-000000000004', 'u1000000-0000-0000-0000-000000000023', 'e1000000-0000-0000-0000-000000000002', 'v1000000-0000-0000-0000-000000000004', 'Beatriz Gomes', 'candidato4@email.com', '(11) 90004-0004', 'Operadora de Caixa', 'aprovado', '{"D":10,"I":35,"S":40,"C":15}', 88, 'ouro', true, '2026-03-20'),
  ('c1000000-0000-0000-0000-000000000005', 'u1000000-0000-0000-0000-000000000024', 'e1000000-0000-0000-0000-000000000002', 'v1000000-0000-0000-0000-000000000005', 'Rafael Duarte', 'candidato5@email.com', '(11) 90005-0005', 'Vendedor', 'em_avaliacao', '{"D":30,"I":40,"S":15,"C":15}', 75, 'prata', true, '2026-03-25'),
  ('c1000000-0000-0000-0000-000000000006', 'u1000000-0000-0000-0000-000000000025', 'e1000000-0000-0000-0000-000000000002', 'v1000000-0000-0000-0000-000000000006', 'Isabela Nunes', 'candidato6@email.com', '(11) 90006-0006', 'Estoquista', 'reprovado', '{"D":45,"I":25,"S":10,"C":20}', 42, null, true, '2026-03-18'),
  -- TechNova
  ('c1000000-0000-0000-0000-000000000007', 'u1000000-0000-0000-0000-000000000026', 'e1000000-0000-0000-0000-000000000003', 'v1000000-0000-0000-0000-000000000007', 'Gabriel Ribeiro', 'candidato7@email.com', '(11) 90007-0007', 'Dev Frontend', 'em_avaliacao', '{"D":20,"I":25,"S":20,"C":35}', 90, 'ouro', true, '2026-04-05'),
  ('c1000000-0000-0000-0000-000000000008', 'u1000000-0000-0000-0000-000000000027', 'e1000000-0000-0000-0000-000000000003', 'v1000000-0000-0000-0000-000000000008', 'Larissa Carvalho', 'candidato8@email.com', '(11) 90008-0008', 'Product Manager', 'entrevista_agendada', '{"D":30,"I":35,"S":15,"C":20}', 82, 'prata', true, '2026-04-06'),
  ('c1000000-0000-0000-0000-000000000009', 'u1000000-0000-0000-0000-000000000028', 'e1000000-0000-0000-0000-000000000003', 'v1000000-0000-0000-0000-000000000009', 'Diego Fernandes', 'candidato9@email.com', '(11) 90009-0009', 'Customer Success', 'inscrito', '{"D":15,"I":40,"S":30,"C":15}', 85, 'ouro', true, '2026-04-07');

-- Colaboradores (2 per empresa)
INSERT INTO colaboradores (id, empresa_id, nome, cargo, email, data_contratacao, origem, status, perfil_disc, proxima_reavaliacao) VALUES
  ('col10000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Patricia Almeida', 'Recepcionista', 'patricia@clinicasorriso.com', '2025-10-15', 'contratacao_direta', 'ativo', '{"D":15,"I":35,"S":35,"C":15}', '2026-04-15'),
  ('col10000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Marcos Vieira', 'Auxiliar Financeiro', 'marcos@clinicasorriso.com', '2025-11-01', 'conversao_candidato', 'ativo', '{"D":20,"I":15,"S":25,"C":40}', '2026-05-01'),
  ('col10000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', 'Sandra Campos', 'Caixa', 'sandra@supermart.com', '2025-09-20', 'contratacao_direta', 'ativo', '{"D":10,"I":30,"S":45,"C":15}', '2026-04-20'),
  ('col10000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002', 'Rodrigo Santos', 'Vendedor', 'rodrigo@supermart.com', '2025-12-10', 'conversao_candidato', 'em_treinamento', '{"D":35,"I":35,"S":15,"C":15}', '2026-06-10'),
  ('col10000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000003', 'Amanda Torres', 'Desenvolvedora', 'amanda@technova.io', '2025-08-01', 'contratacao_direta', 'ativo', '{"D":25,"I":20,"S":20,"C":35}', '2026-04-01'),
  ('col10000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000003', 'Bruno Souza', 'CS Specialist', 'bruno@technova.io', '2026-01-15', 'importacao_planilha', 'em_treinamento', '{"D":15,"I":40,"S":30,"C":15}', '2026-07-15');

-- Feedbacks
INSERT INTO feedbacks (empresa_id, colaborador_id, autor_id, tipo, parar, comecar, continuar, acao, visivel_para_candidato, data_envio) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'col10000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000006', 'interno_colaborador', 'Chegar atrasada', 'Usar o sistema novo de agendamento', 'Atendimento caloroso aos pacientes', 'Participar do treinamento do sistema ate sexta', false, now()),
  ('e1000000-0000-0000-0000-000000000002', 'col10000-0000-0000-0000-000000000004', 'u1000000-0000-0000-0000-000000000008', 'interno_colaborador', 'Deixar clientes esperando', 'Oferecer produtos complementares', 'Energia e entusiasmo', 'Meta: 3 vendas cruzadas por dia', false, now()),
  ('e1000000-0000-0000-0000-000000000001', null, 'u1000000-0000-0000-0000-000000000006', 'externo_candidato', null, null, 'Boa postura durante a entrevista', 'Aguardar retorno em 5 dias uteis', true, now());

-- Update the candidato_id for the external feedback
UPDATE feedbacks SET candidato_id = 'c1000000-0000-0000-0000-000000000002' WHERE tipo = 'externo_candidato' AND empresa_id = 'e1000000-0000-0000-0000-000000000001';

-- Agendamentos
INSERT INTO agendamentos (candidato_id, empresa_id, gestor_responsavel_id, data_hora, tipo, link_reuniao, status, observacoes) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000006', '2026-04-15 14:00:00', 'online', 'https://meet.google.com/abc-defg-hij', 'agendado', 'Entrevista para Auxiliar Financeiro'),
  ('c1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000010', '2026-04-16 10:00:00', 'presencial', null, 'confirmado', 'Entrevista presencial para PM');

-- Alertas
INSERT INTO alertas_automaticos (empresa_id, tipo, destinatario_id, mensagem, lido) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'reavaliacao_vencida', 'u1000000-0000-0000-0000-000000000006', 'Patricia Almeida: reavaliacao de 90 dias vencida em 15/04', false),
  ('e1000000-0000-0000-0000-000000000002', 'candidato_score_baixo', 'u1000000-0000-0000-0000-000000000008', 'Isabela Nunes obteve score 42% na vaga Estoquista', false),
  ('e1000000-0000-0000-0000-000000000003', 'teste_pendente', 'u1000000-0000-0000-0000-000000000010', 'Diego Fernandes ainda nao completou o teste DISC', false);

-- Questoes DISC globais (base)
INSERT INTO questoes_disc (empresa_id, pergunta, opcoes) VALUES
  (null, 'Em uma reuniao de equipe, voce geralmente:', '[{"texto":"Assume a lideranca e direciona a conversa","dimensao":"D"},{"texto":"Anima o grupo e sugere ideias criativas","dimensao":"I"},{"texto":"Ouve atentamente e busca consenso","dimensao":"S"},{"texto":"Analisa dados e questiona a viabilidade","dimensao":"C"}]'),
  (null, 'Quando enfrenta um problema no trabalho:', '[{"texto":"Age rapidamente para resolver","dimensao":"D"},{"texto":"Conversa com colegas para encontrar solucoes","dimensao":"I"},{"texto":"Avalia calmamente antes de tomar uma decisao","dimensao":"S"},{"texto":"Pesquisa e analisa todas as opcoes possiveis","dimensao":"C"}]'),
  (null, 'O que mais te motiva no trabalho:', '[{"texto":"Desafios e resultados","dimensao":"D"},{"texto":"Reconhecimento e interacao social","dimensao":"I"},{"texto":"Estabilidade e harmonia na equipe","dimensao":"S"},{"texto":"Qualidade e precisao do trabalho","dimensao":"C"}]'),
  (null, 'Seu estilo de comunicacao e:', '[{"texto":"Direto e objetivo","dimensao":"D"},{"texto":"Entusiasmado e expressivo","dimensao":"I"},{"texto":"Calmo e paciente","dimensao":"S"},{"texto":"Detalhado e preciso","dimensao":"C"}]'),
  (null, 'Sob pressao, voce tende a:', '[{"texto":"Ficar mais focado e exigente","dimensao":"D"},{"texto":"Falar mais e buscar ajuda","dimensao":"I"},{"texto":"Se retrair e ficar quieto","dimensao":"S"},{"texto":"Se apegar ainda mais aos processos","dimensao":"C"}]');

-- Onboarding example
INSERT INTO onboardings (colaborador_id, empresa_id, etapas, percentual_concluido) VALUES
  ('col10000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002', '[{"titulo":"Conhecer a equipe","concluida":true,"data":"2026-01-10"},{"titulo":"Treinamento do sistema de vendas","concluida":true,"data":"2026-01-12"},{"titulo":"Acompanhar vendedor senior por 1 semana","concluida":false,"data":null},{"titulo":"Primeira venda solo","concluida":false,"data":null}]', 50),
  ('col10000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000003', '[{"titulo":"Setup do ambiente de desenvolvimento","concluida":true,"data":"2026-01-16"},{"titulo":"Leitura da documentacao interna","concluida":false,"data":null},{"titulo":"Primeiro atendimento acompanhado","concluida":false,"data":null}]', 33);

-- Respostas de teste
INSERT INTO respostas_teste (candidato_id, tipo, respostas, resultado, score, duracao_segundos) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'disc', '{}', '{"D":20,"I":30,"S":35,"C":15}', 92, 480),
  ('c1000000-0000-0000-0000-000000000004', 'disc', '{}', '{"D":10,"I":35,"S":40,"C":15}', 88, 520),
  ('c1000000-0000-0000-0000-000000000007', 'disc', '{}', '{"D":20,"I":25,"S":20,"C":35}', 90, 390);
