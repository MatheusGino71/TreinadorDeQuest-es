export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export const sampleQuestions: Question[] = [
  {
    id: "q1",
    text: "Qual é o prazo para impetração de habeas corpus em caso de prisão ilegal?",
    options: [
      "15 dias",
      "30 dias", 
      "Não há prazo específico",
      "60 dias"
    ],
    correctAnswer: 2,
    category: "OAB_1_FASE",
    difficulty: "medium",
    explanation: "O habeas corpus pode ser impetrado a qualquer tempo, não havendo prazo específico para sua impetração em caso de prisão ilegal."
  },
  {
    id: "q2", 
    text: "Segundo o Código de Ética da OAB, é vedado ao advogado:",
    options: [
      "Anunciar-se em qualquer meio de comunicação",
      "Captar clientela por meio de agenciadores",
      "Atuar em mais de uma comarca",
      "Advogar contra cliente que representou anteriormente apenas com autorização expressa"
    ],
    correctAnswer: 1,
    category: "OAB_1_FASE", 
    difficulty: "medium",
    explanation: "É expressamente vedado ao advogado captar clientela por meio de agenciadores, conforme o Código de Ética e Disciplina da OAB."
  },
  {
    id: "q3",
    text: "A competência para julgar habeas corpus contra ato de Desembargador é do:",
    options: [
      "Próprio Tribunal",
      "Superior Tribunal de Justiça",
      "Supremo Tribunal Federal", 
      "Tribunal Regional Federal"
    ],
    correctAnswer: 1,
    category: "OAB_1_FASE",
    difficulty: "hard",
    explanation: "Competência do STJ para julgar habeas corpus contra ato de Desembargador, conforme o art. 105, I, 'c' da Constituição Federal."
  },
  {
    id: "q4",
    text: "O prazo para contestação em processo de conhecimento é de:",
    options: [
      "10 dias",
      "15 dias",
      "20 dias",
      "30 dias"
    ],
    correctAnswer: 1,
    category: "OAB_1_FASE",
    difficulty: "easy", 
    explanation: "O prazo para contestação é de 15 dias, conforme o art. 335 do CPC."
  },
  {
    id: "q5",
    text: "Em relação ao princípio da ampla defesa, é correto afirmar:",
    options: [
      "Aplica-se apenas ao processo penal",
      "Garante o direito ao contraditório e aos recursos",
      "É exclusivo do processo administrativo",
      "Não se aplica a processos civis"
    ],
    correctAnswer: 1,
    category: "OAB_1_FASE",
    difficulty: "easy",
    explanation: "O princípio da ampla defesa garante o direito ao contraditório e aos recursos, aplicando-se a todos os processos."
  },
  {
    id: "q6",
    text: "A prescrição da pretensão executória ocorre em:",
    options: [
      "3 anos",
      "5 anos", 
      "10 anos",
      "20 anos"
    ],
    correctAnswer: 1,
    category: "OAB_1_FASE",
    difficulty: "medium",
    explanation: "A prescrição da pretensão executória ocorre em 5 anos, conforme o art. 797, caput, do CPC."
  },
  {
    id: "q7",
    text: "Qual dos seguintes não é um direito fundamental previsto na Constituição?",
    options: [
      "Direito à vida",
      "Direito à propriedade",
      "Direito ao luxo",
      "Direito à educação"
    ],
    correctAnswer: 2,
    category: "CONCURSOS",
    difficulty: "easy",
    explanation: "O direito ao luxo não é um direito fundamental previsto na Constituição Federal."
  },
  {
    id: "q8",
    text: "O regime jurídico administrativo caracteriza-se pela:",
    options: [
      "Igualdade entre Administração e administrados",
      "Supremacia do interesse público e indisponibilidade do interesse público",
      "Livre negociação de direitos",
      "Autonomia da vontade"
    ],
    correctAnswer: 1,
    category: "CONCURSOS",
    difficulty: "medium",
    explanation: "O regime jurídico administrativo tem como pilares a supremacia do interesse público sobre o particular e a indisponibilidade do interesse público."
  },
  {
    id: "q9",
    text: "A responsabilidade civil do Estado é:",
    options: [
      "Subjetiva",
      "Objetiva",
      "Mista",
      "Inexistente"
    ],
    correctAnswer: 1,
    category: "CONCURSOS",
    difficulty: "medium",
    explanation: "A responsabilidade civil do Estado é objetiva, conforme o art. 37, §6º da Constituição Federal."
  },
  {
    id: "q10",
    text: "O controle de constitucionalidade concentrado é exercido pelo:",
    options: [
      "Qualquer juiz",
      "Tribunais de Justiça",
      "Superior Tribunal de Justiça",
      "Supremo Tribunal Federal"
    ],
    correctAnswer: 3,
    category: "CONCURSOS",
    difficulty: "medium",
    explanation: "O controle de constitucionalidade concentrado é exercido originariamente pelo Supremo Tribunal Federal."
  }
];

export function getQuestionsByCategory(category?: string): Question[] {
  if (!category) return sampleQuestions;
  return sampleQuestions.filter(q => q.category === category);
}

export function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
