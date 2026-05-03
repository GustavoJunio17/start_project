export const DEFAULT_DISC_QUESTIONS = [
  // Dimensão D (Dominância/Direcionamento para Resultados)
  {
    pergunta: 'Prefiro liderar projetos e tomar decisões rapidamente',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'D' as const },
      { texto: 'Concordo', dimensao: 'I' as const },
      { texto: 'Discordo', dimensao: 'S' as const },
      { texto: 'Discordo totalmente', dimensao: 'C' as const },
    ],
  },
  {
    pergunta: 'Sou direto e objetivo ao comunicar minhas ideias',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'D' as const },
      { texto: 'Concordo', dimensao: 'C' as const },
      { texto: 'Discordo', dimensao: 'I' as const },
      { texto: 'Discordo totalmente', dimensao: 'S' as const },
    ],
  },
  {
    pergunta: 'Gosto de desafios e competição no trabalho',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'D' as const },
      { texto: 'Concordo', dimensao: 'I' as const },
      { texto: 'Discordo', dimensao: 'C' as const },
      { texto: 'Discordo totalmente', dimensao: 'S' as const },
    ],
  },
  {
    pergunta: 'Prefiro agir rapidamente mesmo com informações incompletas',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'D' as const },
      { texto: 'Concordo', dimensao: 'I' as const },
      { texto: 'Discordo', dimensao: 'C' as const },
      { texto: 'Discordo totalmente', dimensao: 'S' as const },
    ],
  },
  {
    pergunta: 'Tenho facilidade em delegar responsabilidades',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'D' as const },
      { texto: 'Concordo', dimensao: 'I' as const },
      { texto: 'Discordo', dimensao: 'S' as const },
      { texto: 'Discordo totalmente', dimensao: 'C' as const },
    ],
  },

  // Dimensão I (Influência/Interação com Pessoas)
  {
    pergunta: 'Gosto de trabalhar em equipe e conviver com as pessoas',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'I' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'C' as const },
      { texto: 'Discordo totalmente', dimensao: 'D' as const },
    ],
  },
  {
    pergunta: 'Sou natural em apresentações e falar em público',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'I' as const },
      { texto: 'Concordo', dimensao: 'D' as const },
      { texto: 'Discordo', dimensao: 'C' as const },
      { texto: 'Discordo totalmente', dimensao: 'S' as const },
    ],
  },
  {
    pergunta: 'Prefiro entornos sociais e networking',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'I' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'C' as const },
    ],
  },
  {
    pergunta: 'Consigo motivar e inspirar outras pessoas facilmente',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'I' as const },
      { texto: 'Concordo', dimensao: 'D' as const },
      { texto: 'Discordo', dimensao: 'S' as const },
      { texto: 'Discordo totalmente', dimensao: 'C' as const },
    ],
  },
  {
    pergunta: 'Sou entusiasmado e otimista nas minhas relações',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'I' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'C' as const },
      { texto: 'Discordo totalmente', dimensao: 'D' as const },
    ],
  },

  // Dimensão S (Estabilidade/Suporte aos Outros)
  {
    pergunta: 'Prefiro rotinas previsíveis e ambientes estáveis',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'S' as const },
      { texto: 'Concordo', dimensao: 'C' as const },
      { texto: 'Discordo', dimensao: 'I' as const },
      { texto: 'Discordo totalmente', dimensao: 'D' as const },
    ],
  },
  {
    pergunta: 'Sou paciente e compreensivo com as limitações alheias',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'S' as const },
      { texto: 'Concordo', dimensao: 'I' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'C' as const },
    ],
  },
  {
    pergunta: 'Gosto de ajudar os colegas mesmo sacrificando meu tempo',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'S' as const },
      { texto: 'Concordo', dimensao: 'I' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'C' as const },
    ],
  },
  {
    pergunta: 'Prefiro lealdade e relacionamentos de longo prazo',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'S' as const },
      { texto: 'Concordo', dimensao: 'C' as const },
      { texto: 'Discordo', dimensao: 'I' as const },
      { texto: 'Discordo totalmente', dimensao: 'D' as const },
    ],
  },
  {
    pergunta: 'Sou consistente e confiável em minhas responsabilidades',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'S' as const },
      { texto: 'Concordo', dimensao: 'C' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'I' as const },
    ],
  },

  // Dimensão C (Conformidade/Cautela)
  {
    pergunta: 'Sou cuidadoso e atento aos detalhes',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'C' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'I' as const },
    ],
  },
  {
    pergunta: 'Prefiro seguir processos e procedimentos estabelecidos',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'C' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'I' as const },
      { texto: 'Discordo totalmente', dimensao: 'D' as const },
    ],
  },
  {
    pergunta: 'Gosto de analisar dados antes de tomar decisões',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'C' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'I' as const },
    ],
  },
  {
    pergunta: 'Valorizo qualidade e precisão no trabalho',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'C' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'I' as const },
      { texto: 'Discordo totalmente', dimensao: 'D' as const },
    ],
  },
  {
    pergunta: 'Sou cuidadoso com riscos e preferir o caminho seguro',
    opcoes: [
      { texto: 'Concordo totalmente', dimensao: 'C' as const },
      { texto: 'Concordo', dimensao: 'S' as const },
      { texto: 'Discordo', dimensao: 'D' as const },
      { texto: 'Discordo totalmente', dimensao: 'I' as const },
    ],
  },
]
