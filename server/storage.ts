import { randomUUID } from "crypto";
import { users, gameSessions, questions, type User, type InsertUser, type GameSession, type Question } from "@shared/schema";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;

  // Game session methods
  createGameSession(userId?: string, challengeType?: string): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;

  // Question methods
  getRandomQuestions(limit?: number, challengeType?: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private gameSessions: Map<string, GameSession> = new Map();
  private questions: Map<string, Question> = new Map();

  constructor() {
    this.initializeQuestions();
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      id,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Game session methods
  async createGameSession(userId?: string, challengeType: string = "OAB_1_FASE"): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = {
      id,
      userId,
      challengeType,
      score: 0,
      level: 1,
      lives: 3,
      correctAnswers: 0,
      incorrectAnswers: 0,
      currentStreak: 0,
      questionNumber: 1,
      totalQuestions: 20,
      isGameOver: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const existingSession = this.gameSessions.get(id);
    if (!existingSession) return undefined;

    const updatedSession = { ...existingSession, ...updates, updatedAt: new Date() };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Question methods
  async getRandomQuestions(limit: number = 20, challengeType: string = "OAB_1_FASE"): Promise<Question[]> {
    const filteredQuestions = Array.from(this.questions.values())
      .filter(q => {
        if (challengeType === "OAB_1_FASE") {
          return q.challengeType === "OAB_1_FASE";
        } else if (challengeType === "CONCURSOS") {
          return q.challengeType.startsWith("CONCURSOS");
        }
        return q.challengeType === challengeType;
      });
    
    if (filteredQuestions.length === 0) {
      const allQuestions = Array.from(this.questions.values());
      return allQuestions.slice(0, limit);
    }
    
    return filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  private initializeQuestions() {
    const questionsData = [
      // OAB 1ª FASE - DIREITO CONSTITUCIONAL
      {
        text: "Qual o prazo de mandato do Presidente da República?",
        options: ["3 anos", "4 anos", "5 anos", "6 anos"],
        correctAnswerIndex: 1,
        difficulty: 1,
        category: "Direito Constitucional",
        challengeType: "OAB_1_FASE",
        explanation: "O mandato presidencial é de 4 anos, permitida uma reeleição para o período subsequente."
      },
      {
        text: "Sobre os direitos fundamentais, é correto afirmar:",
        options: ["São absolutos", "Podem ser suspensos a qualquer tempo", "Possuem eficácia horizontal e vertical", "Só se aplicam às relações públicas"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "OAB_1_FASE",
        explanation: "Os direitos fundamentais possuem eficácia horizontal (relações privadas) e vertical (relações com o Estado)."
      },
      {
        text: "O controle de constitucionalidade difuso é exercido:",
        options: ["Apenas pelo STF", "Por qualquer órgão do Poder Judiciário", "Somente pelos Tribunais Superiores", "Exclusivamente nos Tribunais de Justiça"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "OAB_1_FASE",
        explanation: "No controle difuso, qualquer juiz ou tribunal pode declarar a inconstitucionalidade de lei no caso concreto."
      },
      // OAB 1ª FASE - DIREITO CIVIL
      {
        text: "A prescrição aquisitiva é também conhecida como:",
        options: ["Usucapião", "Decadência", "Preclusão", "Caducidade"],
        correctAnswerIndex: 0,
        difficulty: 1,
        category: "Direito Civil",
        challengeType: "OAB_1_FASE",
        explanation: "Usucapião é a forma de aquisição da propriedade pela posse prolongada no tempo com os requisitos legais."
      },
      {
        text: "O prazo prescricional para cobrança de dívida líquida constante de instrumento público é de:",
        options: ["3 anos", "5 anos", "10 anos", "20 anos"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Civil",
        challengeType: "OAB_1_FASE",
        explanation: "Conforme o art. 205 do CC, o prazo geral de prescrição é de 10 anos para dívidas líquidas em instrumento público."
      },
      {
        text: "Sobre a responsabilidade civil, o dano moral:",
        options: ["Precisa ser provado", "É presumido quando há dano material", "Dispensa prova quando in re ipsa", "Só existe se houver culpa"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Direito Civil",
        challengeType: "OAB_1_FASE",
        explanation: "O dano moral in re ipsa dispensa comprovação, sendo presumido pela própria natureza do ato lesivo."
      },
      // OAB 1ª FASE - DIREITO PENAL
      {
        text: "O crime de furto consuma-se com:",
        options: ["A subtração da coisa", "A posse mansa e pacífica", "A saída da esfera de vigilância da vítima", "O proveito econômico"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Penal",
        challengeType: "OAB_1_FASE",
        explanation: "O furto se consuma quando a coisa sai da esfera de vigilância da vítima, ainda que por breve momento."
      },
      {
        text: "São circunstâncias que sempre agravam a pena:",
        options: ["Agravantes genéricas", "Qualificadoras", "Causas de aumento", "Agravantes específicas"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Penal",
        challengeType: "OAB_1_FASE",
        explanation: "As qualificadoras sempre agravam a pena, ao contrário das agravantes que podem ser compensadas pelas atenuantes."
      },
      // OAB 1ª FASE - PROCESSO CIVIL
      {
        text: "Qual é o prazo para apresentação de contestação?",
        options: ["10 dias", "15 dias", "20 dias", "30 dias"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB_1_FASE",
        explanation: "O prazo para contestação é de 15 dias úteis, conforme o CPC."
      },
      {
        text: "A competência territorial pode ser:",
        options: ["Absoluta", "Relativa", "Funcional", "Hierárquica"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB_1_FASE",
        explanation: "A competência territorial é relativa e pode ser prorrogada se não arguida na contestação."
      },
      // OAB 1ª FASE - DIREITO DO TRABALHO
      {
        text: "O prazo prescricional para o trabalhador urbano é de:",
        options: ["2 anos da extinção do contrato", "5 anos até o limite de 2 anos após extinção", "5 anos da violação do direito", "2 anos da violação do direito"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito do Trabalho",
        challengeType: "OAB_1_FASE",
        explanation: "O trabalhador tem até 5 anos para pleitear direitos, limitado a 2 anos após a extinção do contrato."
      },
      // OAB 1ª FASE - DIREITO EMPRESARIAL
      {
        text: "O empresário individual pode:",
        options: ["Ter sócios", "Constituir EIRELI", "Exercer atividade empresarial", "Limitar responsabilidade sem registro"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Empresarial",
        challengeType: "OAB_1_FASE",
        explanation: "O empresário individual exerce atividade empresarial em nome próprio, com responsabilidade ilimitada."
      },
      // CONCURSOS - MPSP
      {
        text: "O Ministério Público tem legitimidade para propor ação civil pública visando:",
        options: ["Apenas interesses difusos", "Apenas interesses coletivos", "Interesses difusos, coletivos e individuais homogêneos", "Apenas direitos individuais"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Processual Civil",
        challengeType: "CONCURSOS_MPSP",
        explanation: "O MP tem legitimidade para tutelar interesses difusos, coletivos e individuais homogêneos."
      },
      {
        text: "A independência funcional dos membros do Ministério Público significa:",
        options: ["Ausência de hierarquia", "Liberdade para formar convicção", "Vitaliciedade", "Inamovibilidade"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_MPSP",
        explanation: "A independência funcional garante liberdade para formar convicção e atuar segundo a lei e a Constituição."
      },
      // CONCURSOS - DEFENSORIA PÚBLICA
      {
        text: "A Defensoria Pública tem como função institucional:",
        options: ["Representar apenas os necessitados", "Assistência jurídica integral e gratuita", "Advocacia privada subsidiada", "Consultoria jurídica paga"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_DEFENSORIA",
        explanation: "A Defensoria Pública presta assistência jurídica integral e gratuita aos necessitados."
      },
      {
        text: "O defensor público tem prerrogativa de:",
        options: ["Intimação pessoal", "Foro privilegiado", "Imunidade parlamentar", "Prisão especial"],
        correctAnswerIndex: 0,
        difficulty: 2,
        category: "Direito Processual",
        challengeType: "CONCURSOS_DEFENSORIA",
        explanation: "Entre as prerrogativas do defensor público está a intimação pessoal em todos os atos processuais."
      },
      // CONCURSOS - TRIBUNAIS
      {
        text: "Compete privativamente ao Tribunal de Justiça:",
        options: ["Julgar prefeitos", "Processar deputados estaduais", "Julgar mandado de segurança contra atos do governador", "Todas as alternativas"],
        correctAnswerIndex: 3,
        difficulty: 3,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_TRIBUNAIS",
        explanation: "São competências privativas do TJ julgar prefeitos, deputados estaduais e mandados de segurança contra atos do governador."
      },
      // CONCURSOS - PROCURADORIAS
      {
        text: "A Advocacia Pública tem como função:",
        options: ["Representar particulares", "Defender interesses do Estado", "Consultoria privada", "Mediação de conflitos"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS_PROCURADORIAS",
        explanation: "A Advocacia Pública representa e defende os interesses do Estado em juízo e fora dele."
      },
      // CONCURSOS - ENAM
      {
        text: "No processo administrativo federal, o contraditório:",
        options: ["É dispensável", "Só se aplica em sanções", "É obrigatório sempre", "Depende da gravidade"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS_ENAM",
        explanation: "O contraditório é princípio obrigatório em todo processo administrativo federal."
      },
      // CONCURSOS - CNU
      {
        text: "O servidor público federal tem direito a:",
        options: ["Licença-prêmio", "Estabilidade após 2 anos", "Irredutibilidade de vencimentos", "Todas as alternativas"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS_CNU",
        explanation: "A irredutibilidade de vencimentos é direito constitucional do servidor público."
      }
    ];

    questionsData.forEach(q => {
      const id = randomUUID();
      this.questions.set(id, { id, ...q, createdAt: new Date() });
    });
  }
}

export const storage = new MemStorage();